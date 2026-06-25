import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { BibliotecaDocument } from './biblioteca-document.entity';

@Entity('biblioteca_chunks')
@Index(['documentoId', 'chunkIndex'])
export class BibliotecaChunk {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  documentoId!: string;

  @ManyToOne(() => BibliotecaDocument, (doc) => doc.chunks, { onDelete: 'CASCADE' })
  documento!: BibliotecaDocument;

  @Column('text')
  content!: string;

  @Column('int', { nullable: true })
  pageNumber?: number;

  @Column('int')
  chunkIndex!: number;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Column('float8', { array: true, nullable: true })
  embedding?: number[];

  @Column('varchar', { length: 100, nullable: true })
  embeddingModel?: string;

  @CreateDateColumn()
  createdAt!: Date;
}

