import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expediente } from './expediente.entity';
import { ExpedientesController } from './expedientes.controller';
import { ExpedientesService } from './expedientes.service';
import { Client } from '../clients/client.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Expediente, Client]), SubscriptionsModule],
  controllers: [ExpedientesController],
  providers: [ExpedientesService],
})
export class ExpedientesModule {}
