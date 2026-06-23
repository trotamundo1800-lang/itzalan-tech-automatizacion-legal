import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaController } from './agenda.controller';
import { AgendaEvent } from './agenda-event.entity';
import { AgendaService } from './agenda.service';
import { Client } from '../clients/client.entity';
import { Expediente } from '../expedientes/expediente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgendaEvent, Client, Expediente])],
  controllers: [AgendaController],
  providers: [AgendaService],
})
export class AgendaModule {}
