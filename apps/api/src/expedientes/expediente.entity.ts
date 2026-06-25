import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../auth/user.entity';
import { Client } from '../clients/client.entity';
import { AiConversation } from '../ia-juridica/ai-conversation.entity';
import { OneToMany } from 'typeorm';

export type ExpedienteEstado = 'abierto' | 'en_proceso' | 'cerrado';

@Entity({ name: 'expedientes' })
export class Expediente {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 140 })
  titulo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ length: 50 })
  tipo!: string;

  @Column({ length: 20, default: 'abierto' })
  estado!: ExpedienteEstado;

  @Column({ type: 'date' })
  fechaApertura!: string;

  @ManyToOne(() => Client, (client) => client.expedientes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'clienteId' })
  cliente!: Client;

  @Column({ type: 'uuid' })
  clienteId!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser?: User | null;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId!: string | null;

  @OneToMany(() => AiConversation, (conversation) => conversation.expediente)
  aiConversations!: AiConversation[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
