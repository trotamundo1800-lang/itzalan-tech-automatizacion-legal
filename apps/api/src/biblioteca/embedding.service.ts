import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

interface EmbeddingResult {
  content: string;
  embedding: number[];
  model: string;
  tokens: number;
}

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private openai: OpenAI | null = null;
  private readonly embeddingModel = 'text-embedding-3-small'; // Fast & cheap, 1536 dimensions
  private readonly batchSize = 20; // OpenAI allows up to 2048 per batch

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'test-key') {
      this.openai = new OpenAI({ apiKey });
      this.logger.log(`OpenAI Embedding Service initialized with model: ${this.embeddingModel}`);
    } else {
      this.logger.warn('OpenAI API key not configured; embeddings will be unavailable');
    }
  }

  /**
   * Generate embedding for a single chunk of text
   * Returns embedding vector (1536 dimensions for text-embedding-3-small)
   */
  async generateEmbedding(content: string): Promise<EmbeddingResult> {
    if (!this.openai) {
      this.logger.warn('OpenAI not configured; returning null embedding');
      return {
        content,
        embedding: [], // Empty array when API not available
        model: this.embeddingModel,
        tokens: 0,
      };
    }

    try {
      const response = await this.openai.embeddings.create({
        input: content,
        model: this.embeddingModel,
      });

      const embedding = response.data[0].embedding;
      const tokens = response.usage.prompt_tokens;

      this.logger.debug(`Generated embedding for text (${content.length} chars, ${tokens} tokens)`);

      return {
        content,
        embedding,
        model: this.embeddingModel,
        tokens,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to generate embedding: ${errorMsg}`);
      throw new Error(`Embedding generation failed: ${errorMsg}`);
    }
  }

  /**
   * Generate embeddings for multiple chunks in batches
   * Uses batch processing to optimize API calls
   */
  async generateEmbeddingsBatch(contents: string[]): Promise<EmbeddingResult[]> {
    if (!this.openai) {
      this.logger.warn('OpenAI not configured; returning empty embeddings');
      return contents.map((content) => ({
        content,
        embedding: [],
        model: this.embeddingModel,
        tokens: 0,
      }));
    }

    const results: EmbeddingResult[] = [];
    const batches = Math.ceil(contents.length / this.batchSize);

    this.logger.log(`Processing ${contents.length} embeddings in ${batches} batches`);

    for (let i = 0; i < contents.length; i += this.batchSize) {
      const batch = contents.slice(i, i + this.batchSize);

      try {
        const response = await this.openai.embeddings.create({
          input: batch,
          model: this.embeddingModel,
        });

        batch.forEach((content, idx) => {
          const embedding = response.data[idx].embedding;
          const tokens = response.usage.prompt_tokens / batch.length; // Approximate per-item

          results.push({
            content,
            embedding,
            model: this.embeddingModel,
            tokens: Math.ceil(tokens),
          });
        });

        this.logger.debug(`Batch ${Math.floor(i / this.batchSize) + 1}/${batches} complete`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Batch embedding failed: ${errorMsg}`);
        throw new Error(`Batch embedding generation failed: ${errorMsg}`);
      }
    }

    return results;
  }

  /**
   * Calculate cosine similarity between two vectors
   * Used for vector-based search relevance scoring
   */
  cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (!vectorA || !vectorB || vectorA.length === 0 || vectorB.length === 0) {
      return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] * vectorA[i];
      magnitudeB += vectorB[i] * vectorB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Get model info (dimensions, cost per 1K tokens)
   */
  getModelInfo() {
    return {
      model: this.embeddingModel,
      dimensions: 1536, // text-embedding-3-small
      costPer1kTokens: 0.02, // USD
      isConfigured: !!this.openai,
    };
  }
}
