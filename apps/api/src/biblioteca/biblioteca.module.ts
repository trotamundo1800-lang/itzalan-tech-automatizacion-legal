import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BibliotecaItem } from './biblioteca-item.entity';
import { BibliotecaController } from './biblioteca.controller';
import { BibliotecaService } from './biblioteca.service';

@Module({
  imports: [TypeOrmModule.forFeature([BibliotecaItem])],
  controllers: [BibliotecaController],
  providers: [BibliotecaService],
})
export class BibliotecaModule {}
