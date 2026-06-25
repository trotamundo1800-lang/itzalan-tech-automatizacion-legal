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
import { DocumentGeneration } from './document-generation.entity';
import { User } from '../auth/user.entity';

export type DocumentFormat = 'docx' | 'pdf';

@Entity({ name: 'legal_documents' })
export class LegalDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 180 })
  nombreArchivo!: string;

  @Column({ length: 120 })
  tipoDocumento!: string;

  @Column({ length: 10 })
  formato!: DocumentFormat;

  @Column({ type: 'text' })
  plantilla!: string;

  @Column({ type: 'simple-json', nullable: true })
  variables!: Record<string, string> | null;

  @Column({ type: 'text' })
  contenidoTexto!: string;

  @Column({ type: 'text' })
  contenidoBase64!: string;

  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  @ManyToOne(() => Client, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'clienteId' })
  cliente?: Client | null;

  @Column({ type: 'uuid', nullable: true })
  clienteId!: string | null;

  @ManyToOne(() => Expediente, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'expedienteId' })
  expediente?: Expediente | null;

  @Column({ type: 'uuid', nullable: true })
  expedienteId!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser?: User | null;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId!: string | null;

  @OneToMany(() => DocumentGeneration, (generation) => generation.document)
  generations!: DocumentGeneration[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
