import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { BibliotecaDocument } from './biblioteca-document.entity';
import { BibliotecaChunk } from './biblioteca-chunk.entity';
import { BibliotecaController } from './biblioteca.controller';
import { BibliotecaService } from './biblioteca.service';
import { TextExtractionService } from './text-extraction.service';
import { IaJuridicaModule } from '../ia-juridica/ia-juridica.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BibliotecaDocument, BibliotecaChunk]),
    MulterModule.register({ dest: 'uploads/biblioteca' }),
    IaJuridicaModule,
  ],
  controllers: [BibliotecaController],
  providers: [BibliotecaService, TextExtractionService], // TextExtractionService will be instantiated but not used until process endpoint is called
  exports: [BibliotecaService],
})
export class BibliotecaModule {}
