import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expediente } from './expediente.entity';
import { ExpedientesController } from './expedientes.controller';
import { ExpedientesService } from './expedientes.service';
import { Client } from '../clients/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expediente, Client])],
  controllers: [ExpedientesController],
  providers: [ExpedientesService],
})
export class ExpedientesModule {}
