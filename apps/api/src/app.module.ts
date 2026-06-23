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
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE === 'postgres' ? 'postgres' : 'sqlite',
      database: process.env.DB_TYPE === 'postgres' ? process.env.DB_NAME || 'itzalan' : process.env.DB_NAME || 'database.sqlite',
      ...(process.env.DB_TYPE === 'postgres'
        ? {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT || 5432),
            username: process.env.DB_USER || 'itzalan',
            password: process.env.DB_PASSWORD || 'changeme',
          }
        : {}),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    ContractsModule,
    ClientsModule,
    ExpedientesModule,
    AgendaModule,
    DocumentosModule,
    IaJuridicaModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
