import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../auth/user.entity';
import { Expediente } from '../expedientes/expediente.entity';
import { AiConversation } from '../ia-juridica/ai-conversation.entity';

@Entity({ name: 'clients' })
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  nombre!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ length: 30 })
  telefono!: string;

  @Column({ type: 'text' })
  direccion!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser?: User | null;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId!: string | null;

  @Column({ length: 20, default: 'activo' })
  estado!: 'activo' | 'inactivo';

  @OneToMany(() => Expediente, (expediente) => expediente.cliente)
  expedientes!: Expediente[];

  @OneToMany(() => AiConversation, (conversation) => conversation.cliente)
  aiConversations!: AiConversation[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
