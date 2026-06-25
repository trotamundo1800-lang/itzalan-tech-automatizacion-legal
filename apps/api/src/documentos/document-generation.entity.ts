import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LegalDocument } from './legal-document.entity';

@Entity({ name: 'document_generations' })
export class DocumentGeneration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => LegalDocument, (document) => document.generations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  document!: LegalDocument;

  @Column({ type: 'uuid' })
  documentId!: string;

  @Column({ length: 10 })
  formato!: 'docx' | 'pdf';

  @Column({ length: 220 })
  nombreArchivo!: string;

  @Column({ type: 'simple-json', nullable: true })
  variablesAplicadas!: Record<string, string> | null;

  @CreateDateColumn()
  createdAt!: Date;
}