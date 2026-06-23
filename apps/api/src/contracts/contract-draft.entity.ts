import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'contract_drafts' })
export class ContractDraft {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  tipoContrato!: string;

  @Column({ length: 150 })
  nombreCliente!: string;

  @Column({ type: 'text' })
  descripcionCaso!: string;

  @Column({ length: 200 })
  titulo!: string;

  @Column({ type: 'text' })
  resumen!: string;

  @Column({ type: 'simple-json' })
  clausulasSugeridas!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}