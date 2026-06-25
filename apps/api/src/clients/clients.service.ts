import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { SubscriptionQuotaService } from '../subscriptions/subscription-quota.service';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly subscriptionQuotaService: SubscriptionQuotaService,
  ) {}

  async create(payload: CreateClientDto, userId: string) {
    await this.subscriptionQuotaService.assertClientLimit(userId);

    const existing = await this.clientRepository.findOne({ where: { email: payload.email } });
    if (existing) {
      throw new ConflictException('El cliente con ese correo ya existe');
    }

    const client = this.clientRepository.create({
      ...payload,
      estado: payload.estado ?? 'activo',
      createdByUserId: userId,
    });

    return this.clientRepository.save(client);
  }

  findAll() {
    return this.clientRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return client;
  }

  async update(id: string, payload: UpdateClientDto) {
    const client = await this.findOne(id);

    if (payload.email && payload.email !== client.email) {
      const existing = await this.clientRepository.findOne({ where: { email: payload.email } });
      if (existing) {
        throw new ConflictException('El cliente con ese correo ya existe');
      }
    }

    Object.assign(client, payload);
    return this.clientRepository.save(client);
  }

  async remove(id: string) {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
    return { message: 'Cliente eliminado' };
  }
}
