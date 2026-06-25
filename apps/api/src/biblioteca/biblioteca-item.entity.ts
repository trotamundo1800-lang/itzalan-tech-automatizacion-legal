import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../auth/user.entity';

export type BibliotecaItemTipo = 'ley' | 'reglamento' | 'jurisprudencia' | 'doctrina' | 'formulario';
export type BibliotecaItemEstado = 'activo' | 'archivado';

@Entity({ name: 'biblioteca_items' })
export class BibliotecaItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  titulo!: string;

  @Column({ length: 30 })
  tipo!: BibliotecaItemTipo;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'text', nullable: true })
  contenido?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  fuente?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url?: string | null;

  @Column({ type: 'varchar', length: 20, default: 'activo' })
  estado!: BibliotecaItemEstado;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser?: User | null;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
