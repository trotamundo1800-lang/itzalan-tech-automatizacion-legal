import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../auth/user.entity';

export type AiTokenType = 'consultation' | 'document_analysis' | 'contract_generation' | 'expediente_summary' | 'conversation';

@Entity({ name: 'ai_token_consumptions' })
export class AiTokenConsumption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 50 })
  type!: AiTokenType;

  @Column({ type: 'integer', default: 0 })
  tokensConsumed!: number;

  @Column({ type: 'varchar', nullable: true, length: 50 })
  provider!: 'anthropic' | 'openai' | 'local' | null;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  model!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'uuid', nullable: true })
  relatedDocumentId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  relatedExpedienteId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  relatedConversationId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
