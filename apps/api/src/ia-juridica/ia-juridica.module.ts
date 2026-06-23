import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IaJuridicaController } from './ia-juridica.controller';
import { IaJuridicaService } from './ia-juridica.service';
import { LegalDocument } from '../documentos/legal-document.entity';
import { Expediente } from '../expedientes/expediente.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [TypeOrmModule.forFeature([LegalDocument, Expediente]), SubscriptionsModule],
  controllers: [IaJuridicaController],
  providers: [IaJuridicaService],
})
export class IaJuridicaModule {}
