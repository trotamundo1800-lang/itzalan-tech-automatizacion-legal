import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BibliotecaItem, BibliotecaItemEstado, BibliotecaItemTipo } from './biblioteca-item.entity';
import { CreateBibliotecaItemDto } from './dto/create-biblioteca-item.dto';
import { UpdateBibliotecaItemDto } from './dto/update-biblioteca-item.dto';

@Injectable()
export class BibliotecaService {
  constructor(
    @InjectRepository(BibliotecaItem)
    private readonly bibliotecaRepository: Repository<BibliotecaItem>,
  ) {}

  create(payload: CreateBibliotecaItemDto, userId: string) {
    const item = this.bibliotecaRepository.create({
      ...payload,
      estado: payload.estado ?? 'activo',
      createdByUserId: userId,
    });
    return this.bibliotecaRepository.save(item);
  }

  findAll(filters?: { tipo?: BibliotecaItemTipo; estado?: BibliotecaItemEstado; q?: string }) {
    const where: Record<string, unknown> = {};

    if (filters?.tipo) {
      where['tipo'] = filters.tipo;
    }

    if (filters?.estado) {
      where['estado'] = filters.estado;
    }

    if (filters?.q) {
      return this.bibliotecaRepository.find({
        where: [
          { ...where, titulo: ILike(`%${filters.q}%`) },
          { ...where, descripcion: ILike(`%${filters.q}%`) },
          { ...where, fuente: ILike(`%${filters.q}%`) },
        ],
        order: { createdAt: 'DESC' },
      });
    }

    return this.bibliotecaRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const item = await this.bibliotecaRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Recurso no encontrado en la biblioteca');
    }
    return item;
  }

  async update(id: string, payload: UpdateBibliotecaItemDto) {
    const item = await this.findOne(id);
    Object.assign(item, payload);
    return this.bibliotecaRepository.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.bibliotecaRepository.remove(item);
    return { message: 'Recurso eliminado de la biblioteca' };
  }
}
