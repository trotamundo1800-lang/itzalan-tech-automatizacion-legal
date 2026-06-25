import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { BibliotecaDocument } from './biblioteca-document.entity';
import { BibliotecaController } from './biblioteca.controller';
import { BibliotecaService } from './biblioteca.service';
import { IaJuridicaModule } from '../ia-juridica/ia-juridica.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BibliotecaDocument]),
    MulterModule.register({ dest: 'uploads/biblioteca' }),
    IaJuridicaModule,
  ],
  controllers: [BibliotecaController],
  providers: [BibliotecaService],
})
export class BibliotecaModule {}
