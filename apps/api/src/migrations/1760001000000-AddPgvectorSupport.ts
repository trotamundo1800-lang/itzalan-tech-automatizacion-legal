import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPgvectorSupport1760001000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Only run on PostgreSQL
    if (queryRunner.connection.driver.options.type !== 'postgres') {
      return;
    }

    // Enable pgvector extension
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS vector;');

    // Add vector column to biblioteca_chunks table (1536 dimensions for text-embedding-3-small)
    await queryRunner.query(
      `ALTER TABLE "biblioteca_chunks" ADD COLUMN "embedding_vector" vector(1536);`,
    );

    // Create index for vector similarity search (using cosine distance)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_biblioteca_chunks_embedding" ON "biblioteca_chunks" USING ivfflat ("embedding_vector" vector_cosine_ops) WITH (lists = 100);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Only run on PostgreSQL
    if (queryRunner.connection.driver.options.type !== 'postgres') {
      return;
    }

    // Drop index first (PostgreSQL requirement)
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_biblioteca_chunks_embedding";`);

    // Drop vector column
    await queryRunner.query(`ALTER TABLE "biblioteca_chunks" DROP COLUMN IF EXISTS "embedding_vector";`);

    // Drop extension
    await queryRunner.query('DROP EXTENSION IF EXISTS vector;');
  }
}
