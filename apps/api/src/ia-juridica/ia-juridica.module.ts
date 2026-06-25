import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IaJuridicaController } from './ia-juridica.controller';
import { IaJuridicaService } from './ia-juridica.service';
import { LegalDocument } from '../documentos/legal-document.entity';
import { Expediente } from '../expedientes/expediente.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { Client } from '../clients/client.entity';
import { User } from '../auth/user.entity';
import { AiConversation } from './ai-conversation.entity';
import { AiMessage } from './ai-message.entity';
import { AiContextSource } from './ai-context-source.entity';
import { IaProviderService } from './ia-provider.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LegalDocument, Expediente, Client, User, AiConversation, AiMessage, AiContextSource]),
    SubscriptionsModule,
  ],
  controllers: [IaJuridicaController],
  providers: [IaJuridicaService, IaProviderService],
})
export class IaJuridicaModule {}
