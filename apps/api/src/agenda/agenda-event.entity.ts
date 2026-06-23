import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Expediente } from '../expedientes/expediente.entity';

export type AgendaEventType = 'audiencia' | 'vencimiento' | 'reunion' | 'diligencia';
export type AgendaEventStatus = 'pendiente' | 'completado' | 'cancelado';

@Entity({ name: 'agenda_events' })
export class AgendaEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'datetime' })
  fechaHora!: string;

  @Column({ length: 30 })
  tipoEvento!: AgendaEventType;

  @Column({ length: 20, default: 'pendiente' })
  estado!: AgendaEventStatus;

  @Column({ type: 'text', nullable: true })
  recordatorio!: string | null;

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
