import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { BibliotecaDocument } from './biblioteca-document.entity';
import { UploadBibliotecaDto } from './dto/upload-biblioteca.dto';
import { FindBibliotecaQueryDto } from './dto/find-biblioteca-query.dto';

/** Allowed MIME types and their canonical names */
const ALLOWED_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
};

@Injectable()
export class BibliotecaService {
  constructor(
    @InjectRepository(BibliotecaDocument)
    private readonly bibliotecaRepository: Repository<BibliotecaDocument>,
  ) {}

  /** Validate MIME type and return safe extension */
  validateMimeType(mimeType: string): string {
    const ext = ALLOWED_MIME[mimeType];
    if (!ext) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo se aceptan PDF, DOCX y TXT.',
      );
    }
    return ext;
  }

  /** Return a sanitized display name (strip path separators) */
  sanitizeFilename(original: string): string {
    return path
      .basename(original)
      .replace(/[^a-zA-Z0-9._\- ]/g, '_')
      .slice(0, 200);
  }

  async create(
    file: Express.Multer.File,
    payload: UploadBibliotecaDto,
    userId: string,
  ): Promise<BibliotecaDocument> {
    this.validateMimeType(file.mimetype);

    const doc = this.bibliotecaRepository.create({
      titulo: payload.titulo.trim(),
      tipoDocumento: payload.tipoDocumento,
      categoria: payload.categoria.trim(),
      descripcion: payload.descripcion?.trim() ?? null,
      archivoNombre: this.sanitizeFilename(file.originalname),
      archivoRuta: file.path.replace(/\\/g, '/'),
      mimeType: file.mimetype,
      tamano: file.size,
      vectorId: null,
      usuarioId: userId,
    });

    return this.bibliotecaRepository.save(doc);
  }

  findAll(filters: FindBibliotecaQueryDto): Promise<BibliotecaDocument[]> {
    const base: Record<string, unknown> = {};

    if (filters.tipoDocumento) base['tipoDocumento'] = filters.tipoDocumento;
    if (filters.categoria) base['categoria'] = filters.categoria;

    if (filters.q) {
      return this.bibliotecaRepository.find({
        where: [
          { ...base, titulo: ILike(`%${filters.q}%`) },
          { ...base, descripcion: ILike(`%${filters.q}%`) },
          { ...base, categoria: ILike(`%${filters.q}%`) },
        ],
        order: { createdAt: 'DESC' },
      });
    }

    return this.bibliotecaRepository.find({
      where: base,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<BibliotecaDocument> {
    const doc = await this.bibliotecaRepository.findOne({ where: { id } });
    if (!doc) {
      throw new NotFoundException('Documento no encontrado en la biblioteca');
    }
    return doc;
  }

  async remove(id: string): Promise<{ message: string }> {
    const doc = await this.findOne(id);

    // Delete physical file if it exists
    if (doc.archivoRuta && fs.existsSync(doc.archivoRuta)) {
      fs.unlinkSync(doc.archivoRuta);
    }

    await this.bibliotecaRepository.remove(doc);
    return { message: 'Documento eliminado de la biblioteca' };
  }

  /** Returns the absolute resolved path for serving the file */
  async resolveFilePath(id: string): Promise<{ filePath: string; mimeType: string; filename: string }> {
    const doc = await this.findOne(id);
    const resolved = path.resolve(doc.archivoRuta);

    // Prevent path traversal: ensure file is inside the uploads directory
    const uploadsDir = path.resolve('uploads/biblioteca');
    if (!resolved.startsWith(uploadsDir)) {
      throw new BadRequestException('Ruta de archivo inválida');
    }

    if (!fs.existsSync(resolved)) {
      throw new NotFoundException('El archivo físico no está disponible');
    }

    return { filePath: resolved, mimeType: doc.mimeType, filename: doc.archivoNombre };
  }
}

