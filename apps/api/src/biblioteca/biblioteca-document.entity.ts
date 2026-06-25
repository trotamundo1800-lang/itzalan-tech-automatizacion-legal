import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../auth/user.entity';
import { BibliotecaChunk } from './biblioteca-chunk.entity';

export type BibliotecaTipoDocumento =
  | 'ley'
  | 'reglamento'
  | 'jurisprudencia'
  | 'doctrina'
  | 'formulario'
  | 'otro';

export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed';

@Entity({ name: 'biblioteca_documents' })
export class BibliotecaDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  titulo!: string;

  @Column({ type: 'varchar', length: 30 })
  tipoDocumento!: BibliotecaTipoDocumento;

  @Column({ type: 'varchar', length: 100 })
  categoria!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string | null;

  /** Sanitized original filename stored for display */
  @Column({ type: 'varchar', length: 255 })
  archivoNombre!: string;

  /** Relative path inside uploads/ directory */
  @Column({ type: 'varchar', length: 500 })
  archivoRuta!: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType!: string;

  /** File size in bytes */
  @Column({ type: 'integer' })
  tamano!: number;

  /** NULL placeholder for future RAG embedding vector ID */
  @Column({ type: 'varchar', nullable: true })
  vectorId?: string | null;

  /** Extracted text from document (Phase 2 RAG) */
  @Column({ type: 'text', nullable: true })
  extractedText?: string | null;

  /** Extraction status: pending (default), processing, completed, failed */
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  extractionStatus!: ExtractionStatus;

  /** Timestamp when text extraction was completed */
  @Column({ type: 'timestamp', nullable: true })
  extractedAt?: Date | null;

  /** Chunks of this document for RAG/embeddings */
  @OneToMany(() => BibliotecaChunk, (chunk) => chunk.documento, { lazy: false })
  chunks?: BibliotecaChunk[];

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuarioId' })
  usuario?: User | null;

  @Column({ type: 'uuid', nullable: true })
  usuarioId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
