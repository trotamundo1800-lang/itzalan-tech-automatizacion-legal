import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateAiTokenConsumption1782596008001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable("ai_token_consumptions");
        
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: "ai_token_consumptions",
                    columns: [
                        {
                            name: "id",
                            type: "uuid",
                            isPrimary: true,
                            generationStrategy: "uuid",
                            default: "gen_random_uuid()",
                        },
                        {
                            name: "userId",
                            type: "uuid",
                        },
                        {
                            name: "type",
                            type: "varchar",
                            length: "50",
                        },
                        {
                            name: "tokensConsumed",
                            type: "integer",
                            default: 0,
                        },
                        {
                            name: "provider",
                            type: "varchar",
                            length: "50",
                            isNullable: true,
                        },
                        {
                            name: "model",
                            type: "varchar",
                            length: "100",
                            isNullable: true,
                        },
                        {
                            name: "description",
                            type: "text",
                            isNullable: true,
                        },
                        {
                            name: "relatedDocumentId",
                            type: "uuid",
                            isNullable: true,
                        },
                        {
                            name: "relatedExpedienteId",
                            type: "uuid",
                            isNullable: true,
                        },
                        {
                            name: "relatedConversationId",
                            type: "uuid",
                            isNullable: true,
                        },
                        {
                            name: "createdAt",
                            type: "timestamp",
                            default: "now()",
                        },
                    ],
                }),
            );

            await queryRunner.createForeignKey(
                "ai_token_consumptions",
                new TableForeignKey({
                    columnNames: ["userId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "user",
                    onDelete: "CASCADE",
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable("ai_token_consumptions");
        if (tableExists) {
            await queryRunner.dropTable("ai_token_consumptions");
        }
    }

}
