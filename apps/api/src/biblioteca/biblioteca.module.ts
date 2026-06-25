import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { BibliotecaDocument } from './biblioteca-document.entity';
import { BibliotecaController } from './biblioteca.controller';
import { BibliotecaService } from './biblioteca.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BibliotecaDocument]),
    MulterModule.register({ dest: 'uploads/biblioteca' }),
  ],
  controllers: [BibliotecaController],
  providers: [BibliotecaService],
})
export class BibliotecaModule {}
