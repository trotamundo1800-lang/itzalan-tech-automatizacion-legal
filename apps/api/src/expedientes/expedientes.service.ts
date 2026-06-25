import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expediente, ExpedienteEstado } from './expediente.entity';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { Client } from '../clients/client.entity';
import { SubscriptionQuotaService } from '../subscriptions/subscription-quota.service';

@Injectable()
export class ExpedientesService {
  constructor(
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly subscriptionQuotaService: SubscriptionQuotaService,
  ) {}

  private async ensureClientExists(clienteId: string) {
    const client = await this.clientRepository.findOne({ where: { id: clienteId } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
  }

  async create(payload: CreateExpedienteDto, userId: string) {
    await this.subscriptionQuotaService.assertExpedienteLimit(userId);
    await this.ensureClientExists(payload.clienteId);
    const expediente = this.expedienteRepository.create({
      ...payload,
      createdByUserId: userId,
    });
    return this.expedienteRepository.save(expediente);
  }

  findAll(filters?: { clienteId?: string; estado?: ExpedienteEstado }) {
    const where = {
      ...(filters?.clienteId ? { clienteId: filters.clienteId } : {}),
      ...(filters?.estado ? { estado: filters.estado } : {}),
    };

    return this.expedienteRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: { cliente: true },
    });
  }

  async findOne(id: string) {
    const expediente = await this.expedienteRepository.findOne({
      where: { id },
      relations: { cliente: true },
    });
    if (!expediente) {
      throw new NotFoundException('Expediente no encontrado');
    }

    return expediente;
  }

  async update(id: string, payload: UpdateExpedienteDto) {
    const expediente = await this.findOne(id);

    if (payload.clienteId) {
      await this.ensureClientExists(payload.clienteId);
    }

    Object.assign(expediente, payload);
    return this.expedienteRepository.save(expediente);
  }

  async remove(id: string) {
    const expediente = await this.findOne(id);
    await this.expedienteRepository.remove(expediente);
    return { message: 'Expediente eliminado' };
  }
}
