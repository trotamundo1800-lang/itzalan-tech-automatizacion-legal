import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Expediente } from '../expedientes/expediente.entity';

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

  @Column({ length: 20, default: 'activo' })
  estado!: 'activo' | 'inactivo';

  @OneToMany(() => Expediente, (expediente) => expediente.cliente)
  expedientes!: Expediente[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
