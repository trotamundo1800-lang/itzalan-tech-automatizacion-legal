import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialCoreTables1760000000000 implements MigrationInterface {
  name = 'InitialCoreTables1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const isPostgres = queryRunner.connection.options.type === 'postgres';

    if (isPostgres) {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS ai_queries (
          id uuid PRIMARY KEY,
          user_id uuid,
          query_text text NOT NULL,
          response_text text,
          metadata jsonb,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      return;
    }

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ai_queries (
        id varchar(36) PRIMARY KEY,
        user_id varchar(36),
        query_text text NOT NULL,
        response_text text,
        metadata text,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS ai_queries');
  }
}