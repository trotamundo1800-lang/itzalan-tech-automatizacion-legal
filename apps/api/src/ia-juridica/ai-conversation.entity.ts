import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../clients/client.entity';
import { Expediente } from '../expedientes/expediente.entity';
import { User } from '../auth/user.entity';
import { AiMessage } from './ai-message.entity';
import { AiContextSource } from './ai-context-source.entity';

@Entity({ name: 'ai_conversations' })
export class AiConversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 160 })
  title!: string;

  @Column({ type: 'text', default: 'general' })
  contextoJuridico!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => Client, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'clienteId' })
  cliente?: Client | null;

  @Column({ type: 'uuid', nullable: true })
  clienteId?: string | null;

  @ManyToOne(() => Expediente, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'expedienteId' })
  expediente?: Expediente | null;

  @Column({ type: 'uuid', nullable: true })
  expedienteId?: string | null;

  @OneToMany(() => AiMessage, (message) => message.conversation)
  messages!: AiMessage[];

  @OneToMany(() => AiContextSource, (source) => source.conversation)
  contextSources!: AiContextSource[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}