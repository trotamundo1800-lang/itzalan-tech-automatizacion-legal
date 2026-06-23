import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgendaEvent } from './agenda-event.entity';
import { CreateAgendaEventDto } from './dto/create-agenda-event.dto';
import { UpdateAgendaEventDto } from './dto/update-agenda-event.dto';
import { Client } from '../clients/client.entity';
import { Expediente } from '../expedientes/expediente.entity';

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(AgendaEvent)
    private readonly agendaRepository: Repository<AgendaEvent>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,
  ) {}

  private async ensureClientExists(clienteId: string) {
    const client = await this.clientRepository.findOne({ where: { id: clienteId } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
  }

  private async resolveRelations(payload: Pick<CreateAgendaEventDto, 'clienteId' | 'expedienteId'>) {
    let clienteId = payload.clienteId ?? null;
    let expedienteId = payload.expedienteId ?? null;

    if (expedienteId) {
      const expediente = await this.expedienteRepository.findOne({ where: { id: expedienteId } });
      if (!expediente) {
        throw new NotFoundException('Expediente no encontrado');
      }

      if (clienteId && clienteId !== expediente.clienteId) {
        throw new BadRequestException('El expediente no pertenece al cliente seleccionado');
      }

      clienteId = clienteId ?? expediente.clienteId;
    }

    if (clienteId) {
      await this.ensureClientExists(clienteId);
    }

    return { clienteId, expedienteId };
  }

  async create(payload: CreateAgendaEventDto) {
    const relations = await this.resolveRelations(payload);

    const agendaEvent = this.agendaRepository.create({
      fechaHora: payload.fechaHora,
      tipoEvento: payload.tipoEvento,
      estado: payload.estado ?? 'pendiente',
      recordatorio: payload.recordatorio ?? null,
      observaciones: payload.observaciones ?? null,
      clienteId: relations.clienteId,
      expedienteId: relations.expedienteId,
    });

    return this.agendaRepository.save(agendaEvent);
  }

  findAll() {
    return this.agendaRepository.find({
      order: { fechaHora: 'ASC' },
      relations: { cliente: true, expediente: true },
    });
  }

  async findOne(id: string) {
    const agendaEvent = await this.agendaRepository.findOne({
      where: { id },
      relations: { cliente: true, expediente: true },
    });

    if (!agendaEvent) {
      throw new NotFoundException('Evento de agenda no encontrado');
    }

    return agendaEvent;
  }

  async update(id: string, payload: UpdateAgendaEventDto) {
    const agendaEvent = await this.findOne(id);
    const relations = await this.resolveRelations({
      clienteId: payload.clienteId ?? agendaEvent.clienteId ?? undefined,
      expedienteId: payload.expedienteId ?? agendaEvent.expedienteId ?? undefined,
    });

    Object.assign(agendaEvent, {
      ...payload,
      clienteId: relations.clienteId,
      expedienteId: relations.expedienteId,
      recordatorio: payload.recordatorio ?? agendaEvent.recordatorio,
      observaciones: payload.observaciones ?? agendaEvent.observaciones,
    });

    return this.agendaRepository.save(agendaEvent);
  }

  async remove(id: string) {
    const agendaEvent = await this.findOne(id);
    await this.agendaRepository.remove(agendaEvent);
    return { message: 'Evento de agenda eliminado' };
  }
}
