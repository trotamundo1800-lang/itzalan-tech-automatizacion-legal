import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { SubscriptionPlan } from './subscription-plan.entity';
import { UserSubscription } from './user-subscription.entity';
import { PaymentTransaction } from './payment-transaction.entity';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PremiumGuard } from './premium.guard';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan, UserSubscription, PaymentTransaction])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PremiumGuard, Reflector],
  exports: [SubscriptionsService, PremiumGuard],
})
export class SubscriptionsModule {}
