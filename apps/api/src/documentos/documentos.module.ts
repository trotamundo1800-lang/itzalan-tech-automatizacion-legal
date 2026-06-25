import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { LegalDocument } from './legal-document.entity';
import { DocumentGeneration } from './document-generation.entity';
import { Client } from '../clients/client.entity';
import { Expediente } from '../expedientes/expediente.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AiConversation } from '../ia-juridica/ai-conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LegalDocument, DocumentGeneration, Client, Expediente, AiConversation]), SubscriptionsModule],
  controllers: [DocumentosController],
  providers: [DocumentosService],
  exports: [DocumentosService],
})
export class DocumentosModule {}
