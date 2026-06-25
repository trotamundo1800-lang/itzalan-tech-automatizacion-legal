import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Client]), SubscriptionsModule],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService, TypeOrmModule],
})
export class ClientsModule {}
