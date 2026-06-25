import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { AiConversation } from './ai-conversation.entity';

export type AiMode = 'local' | 'openai';

@Entity({ name: 'ai_messages' })
export class AiMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => AiConversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation!: AiConversation;

  @RelationId((message: AiMessage) => message.conversation)
  conversationId!: string;

  @Column({ type: 'text' })
  preguntaUsuario!: string;

  @Column({ type: 'text' })
  respuestaIa!: string;

  @Column({ type: 'varchar', length: 20, default: 'local' })
  modo!: AiMode;

  @Column({ type: 'text' })
  contextoJuridico!: string;

  @Column({ type: 'text', nullable: true })
  analisis?: string | null;

  @Column({ type: 'simple-json', nullable: true })
  recomendaciones?: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  riesgos?: string[] | null;

  @Column({ type: 'text', nullable: true })
  proyeccionCaso?: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}