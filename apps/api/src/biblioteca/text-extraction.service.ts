import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { BibliotecaDocument, ExtractionStatus } from './biblioteca-document.entity';
import { BibliotecaChunk } from './biblioteca-chunk.entity';
import { EmbeddingService } from './embedding.service';

interface TextExtractionResult {
  text: string;
  pageCount?: number;
}

@Injectable()
export class TextExtractionService {
  private readonly logger = new Logger(TextExtractionService.name);
  private pdfParse: any = null;
  private mammoth: any = null;

  constructor(
    @InjectRepository(BibliotecaDocument)
    private readonly docRepository: Repository<BibliotecaDocument>,
    @InjectRepository(BibliotecaChunk)
    private readonly chunkRepository: Repository<BibliotecaChunk>,
    private readonly embeddingService: EmbeddingService,
  ) {
    this.logger.debug('TextExtractionService initialized');
  }

  /** Lazy load pdf-parse only when needed */
  private async getPdfParse() {
    if (!this.pdfParse) {
      try {
        this.pdfParse = require('pdf-parse');
      } catch (error) {
        throw new BadRequestException('pdf-parse module not available');
      }
    }
    return this.pdfParse;
  }

  /** Lazy load mammoth only when needed */
  private async getMammoth() {
    if (!this.mammoth) {
      try {
        this.mammoth = await import('mammoth');
      } catch (error) {
        throw new BadRequestException('mammoth module not available');
      }
    }
    return this.mammoth;
  }

  /** Extract text from PDF using pdf-parse */
  private async extractTextFromPdf(filePath: string): Promise<TextExtractionResult> {
    try {
      const pdfParse = await this.getPdfParse();
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return {
        text: data.text || '',
        pageCount: data.numpages || 0,
      };
    } catch (error) {
      const msg = (error as Error).message || 'Unknown PDF parsing error';
      throw new BadRequestException(`Error extrayendo PDF: ${msg}`);
    }
  }

  /** Extract text from DOCX using mammoth */
  private async extractTextFromDocx(filePath: string): Promise<TextExtractionResult> {
    try {
      const mammoth = await this.getMammoth();
      const buffer = fs.readFileSync(filePath);
      const result = await (mammoth.extractRawText || mammoth.default.extractRawText)({ buffer });
      return { text: result.value || '' };
    } catch (error) {
      const msg = (error as Error).message || 'Unknown DOCX parsing error';
      throw new BadRequestException(`Error extrayendo DOCX: ${msg}`);
    }
  }

  /** Extract text from TXT */
  private async extractTextFromTxt(filePath: string): Promise<TextExtractionResult> {
    try {
      const text = fs.readFileSync(filePath, 'utf-8');
      return { text };
    } catch (error) {
      throw new BadRequestException(`Error leyendo TXT: ${(error as Error).message}`);
    }
  }

  /** Extract text based on MIME type */
  private async extractText(filePath: string, mimeType: string): Promise<TextExtractionResult> {
    const ext = path.extname(filePath).toLowerCase();

    if (mimeType === 'application/pdf' || ext === '.pdf') {
      return this.extractTextFromPdf(filePath);
    }
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === '.docx'
    ) {
      return this.extractTextFromDocx(filePath);
    }
    if (mimeType === 'text/plain' || ext === '.txt') {
      return this.extractTextFromTxt(filePath);
    }

    throw new BadRequestException(`Formato de archivo no soportado: ${mimeType}`);
  }

  /** Split text into overlapping chunks */
  private chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim().length > 0) {
        chunks.push(chunk);
      }
    }

    return chunks;
  }

  /** Process a document: extract text, create chunks, save to DB */
  async processDocument(documentId: string): Promise<{
    success: boolean;
    chunkCount: number;
    charCount: number;
    error?: string;
  }> {
    const doc = await this.docRepository.findOne({ where: { id: documentId } });
    if (!doc) {
      throw new NotFoundException('Documento no encontrado');
    }

    // Set status to processing
    await this.docRepository.update(documentId, { extractionStatus: 'processing' });

    try {
      // Resolve file path
      const resolved = path.resolve(doc.archivoRuta);
      const uploadsDir = path.resolve('uploads/biblioteca');
      if (!resolved.startsWith(uploadsDir)) {
        throw new BadRequestException('Ruta de archivo inválida');
      }
      if (!fs.existsSync(resolved)) {
        throw new NotFoundException('El archivo físico no está disponible');
      }

      // Extract text
      this.logger.log(`Extrayendo texto de ${doc.titulo} (${doc.mimeType})`);
      const extraction = await this.extractText(resolved, doc.mimeType);
      const { text } = extraction;

      // Store extracted text in document
      const truncatedText = text.slice(0, 1000000); // PostgreSQL text limit safeguard
      await this.docRepository.update(documentId, {
        extractedText: truncatedText,
        extractedAt: new Date(),
      });

      // Create chunks
      this.logger.log(`Creando chunks para ${doc.titulo}`);
      const chunks = this.chunkText(text);

      // Delete existing chunks
      await this.chunkRepository.delete({ documentoId: documentId });

      // Generate embeddings for all chunks in batch
      this.logger.log(`Generando embeddings para ${chunks.length} chunks`);
      const embeddings = await this.embeddingService.generateEmbeddingsBatch(chunks);

      // Save new chunks with embeddings
      const chunkEntities = chunks.map((content, index) => {
        const embedding = embeddings[index];
        return this.chunkRepository.create({
          documentoId: documentId,
          content,
          chunkIndex: index,
          pageNumber: extraction.pageCount ? Math.floor(index / 5) + 1 : undefined,
          metadata: JSON.stringify({
            wordCount: content.split(/\s+/).length,
            charCount: content.length,
          }),
          // Store embedding as JSON string for SQLite
          embedding: embedding.embedding.length > 0 ? JSON.stringify(embedding.embedding) : undefined,
          // Store embedding vector for PostgreSQL (if available)
          embeddingVector: embedding.embedding.length > 0 ? embedding.embedding : undefined,
          embeddingModel: embedding.embedding.length > 0 ? embedding.model : undefined,
        });
      });

      await this.chunkRepository.save(chunkEntities);

      // Mark as completed
      await this.docRepository.update(documentId, { extractionStatus: 'completed' });

      this.logger.log(
        `Procesamiento completado: ${chunks.length} chunks, ${text.length} caracteres`,
      );

      return {
        success: true,
        chunkCount: chunks.length,
        charCount: text.length,
      };
    } catch (error) {
      const errorMsg = (error as Error).message;
      this.logger.error(`Error procesando documento: ${errorMsg}`, error);

      // Mark as failed
      await this.docRepository.update(documentId, { extractionStatus: 'failed' });

      throw error;
    }
  }

  /** Get chunks for a document with optional filtering */
  async getDocumentChunks(documentId: string, limit?: number) {
    const query = this.chunkRepository.createQueryBuilder('chunk').where('chunk.documentoId = :documentId', {
      documentoId: documentId,
    });

    if (limit) {
      query.limit(limit);
    }

    return query.orderBy('chunk.chunkIndex', 'ASC').getMany();
  }

  /** Search chunks by vector similarity (preferred) or keyword fallback */
  async searchChunks(query: string, limit: number = 5): Promise<BibliotecaChunk[]> {
    // Try vector-based search first
    try {
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      if (queryEmbedding.embedding.length > 0) {
        return await this.searchChunksByVector(queryEmbedding.embedding, limit);
      }
    } catch (error) {
      this.logger.warn(`Vector search failed, falling back to keyword search: ${(error as Error).message}`);
    }

    // Fallback to keyword search
    return await this.searchChunksByKeyword(query, limit);
  }

  /** Search chunks using vector similarity */
  private async searchChunksByVector(queryEmbedding: number[], limit: number = 5): Promise<BibliotecaChunk[]> {
    const allChunks = await this.chunkRepository.find();

    // Score all chunks by cosine similarity
    const scored = allChunks
      .map((chunk) => {
        let chunkEmbedding: number[] = [];

        // Try to get embedding from vector field first, then from JSON text field
        if (chunk.embeddingVector && chunk.embeddingVector.length > 0) {
          chunkEmbedding = chunk.embeddingVector;
        } else if (chunk.embedding) {
          try {
            chunkEmbedding = JSON.parse(chunk.embedding);
          } catch (e) {
            // Invalid JSON, skip
          }
        }

        const similarity = this.embeddingService.cosineSimilarity(queryEmbedding, chunkEmbedding);
        return { chunk, similarity };
      })
      .filter((item) => item.similarity > 0) // Only include chunks with embeddings
      .sort((a, b) => b.similarity - a.similarity); // Sort by relevance descending

    this.logger.debug(`Vector search found ${scored.length} chunks with embeddings`);

    return scored.slice(0, limit).map((item) => item.chunk);
  }

  /** Fallback: Search chunks using keyword matching */
  private async searchChunksByKeyword(query: string, limit: number = 5): Promise<BibliotecaChunk[]> {
    const keywords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    if (keywords.length === 0) {
      return [];
    }

    const qb = this.chunkRepository.createQueryBuilder('chunk');

    // Build OR conditions for each keyword
    let where = 'LOWER(chunk.content) LIKE :kw0';
    const params: Record<string, any> = {};
    params[`kw0`] = `%${keywords[0]}%`;

    for (let i = 1; i < keywords.length; i++) {
      where += ` OR LOWER(chunk.content) LIKE :kw${i}`;
      params[`kw${i}`] = `%${keywords[i]}%`;
    }

    const results = await qb.where(where, params).orderBy('chunk.createdAt', 'DESC').limit(limit).getMany();

    this.logger.debug(`Keyword search found ${results.length} chunks`);

    return results;
  }
}
