import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../auth/user.entity';

export type BibliotecaTipoDocumento =
  | 'ley'
  | 'reglamento'
  | 'jurisprudencia'
  | 'doctrina'
  | 'formulario'
  | 'otro';

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
