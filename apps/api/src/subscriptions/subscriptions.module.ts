import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { SubscriptionPlan } from './subscription-plan.entity';
import { UserSubscription } from './user-subscription.entity';
import { PaymentTransaction } from './payment-transaction.entity';
import { AiTokenConsumption } from './ai-token-consumption.entity';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PremiumGuard } from './premium.guard';
import { SubscriptionQuotaService } from './subscription-quota.service';
import { AiTokenService } from './ai-token.service';
import { Client } from '../clients/client.entity';
import { Expediente } from '../expedientes/expediente.entity';
import { LegalDocument } from '../documentos/legal-document.entity';
import { DocumentGeneration } from '../documentos/document-generation.entity';
import { AiConversation } from '../ia-juridica/ai-conversation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      UserSubscription,
      PaymentTransaction,
      AiTokenConsumption,
      Client,
      Expediente,
      LegalDocument,
      DocumentGeneration,
      AiConversation,
    ]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PremiumGuard, Reflector, SubscriptionQuotaService, AiTokenService],
  exports: [SubscriptionsService, PremiumGuard, SubscriptionQuotaService, AiTokenService],
})
export class SubscriptionsModule {}
