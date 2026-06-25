import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ContractsModule } from './contracts/contracts.module';
import { ClientsModule } from './clients/clients.module';
import { ExpedientesModule } from './expedientes/expedientes.module';
import { AgendaModule } from './agenda/agenda.module';
import { DocumentosModule } from './documentos/documentos.module';
import { IaJuridicaModule } from './ia-juridica/ia-juridica.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { FeedbackModule } from './feedback/feedback.module';
import { BibliotecaModule } from './biblioteca/biblioteca.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getTypeOrmConfig } from './database/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    AuthModule,
    ClientsModule,
    ExpedientesModule,
    AgendaModule,
    ContractsModule,
    DocumentosModule,
    IaJuridicaModule,
    SubscriptionsModule,
    FeedbackModule,
    BibliotecaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
