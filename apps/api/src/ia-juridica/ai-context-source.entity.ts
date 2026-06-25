import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AiConversation } from './ai-conversation.entity';

export type AiContextSourceType = 'expediente' | 'cliente' | 'documento' | 'nota';

@Entity({ name: 'ai_context_sources' })
export class AiContextSource {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => AiConversation, (conversation) => conversation.contextSources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation!: AiConversation;

  @Column({ type: 'uuid' })
  conversationId!: string;

  @Column({ type: 'varchar', length: 20 })
  sourceType!: AiContextSourceType;

  @Column({ type: 'varchar', length: 120 })
  label!: string;

  @Column({ type: 'uuid' })
  sourceId!: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}