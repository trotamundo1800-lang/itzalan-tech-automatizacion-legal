import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('feedback')
export class FeedbackEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  nombre!: string;

  @Column({ type: 'varchar' })
  profesion!: string;

  @Column({ type: 'varchar', nullable: true })
  areaPractica?: string;

  @Column({ type: 'varchar' })
  ciudad!: string;

  @Column({ type: 'varchar', nullable: true })
  experienciaGeneral?: string;

  @Column({ type: 'varchar', nullable: true })
  moduloMasUtil?: string;

  @Column({ type: 'varchar', nullable: true })
  problemasRegistro?: string;

  @Column({ type: 'varchar', nullable: true })
  utilidadClientesExpedientes?: string;

  @Column({ type: 'text', nullable: true })
  documentosFrecuentes?: string;

  @Column({ type: 'text', nullable: true })
  formatosAgregar?: string;

  @Column({ type: 'varchar', nullable: true })
  ayudaIA?: string;

  @Column({ type: 'varchar', nullable: true })
  claridadIA?: string;

  @Column({ type: 'text', nullable: true })
  consultasIA?: string;

  @Column({ type: 'varchar', nullable: true })
  pagaria?: string;

  @Column({ type: 'varchar', nullable: true })
  planInteres?: string;

  @Column({ type: 'varchar', nullable: true })
  precioRazonable?: string;

  @Column({ type: 'text', nullable: true })
  funcionPago?: string;

  @Column({ type: 'varchar', nullable: true })
  recomendaria?: string;

  @Column({ type: 'varchar' })
  calificacion!: string;

  @Column({ type: 'text', nullable: true })
  mejoras?: string;

  @Column({ type: 'text', nullable: true })
  comentarios?: string;

  @Column({ type: 'varchar', nullable: true })
  ipAddress?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
