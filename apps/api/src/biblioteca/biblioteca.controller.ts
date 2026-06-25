import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { BibliotecaService } from './biblioteca.service';
import { CreateBibliotecaItemDto } from './dto/create-biblioteca-item.dto';
import { UpdateBibliotecaItemDto } from './dto/update-biblioteca-item.dto';
import { FindBibliotecaQueryDto } from './dto/find-biblioteca-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller(['api/biblioteca', 'biblioteca'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'abogado', 'asistente')
export class BibliotecaController {
  constructor(private readonly bibliotecaService: BibliotecaService) {}

  @Post()
  create(
    @Request() req: { user: { userId: string } },
    @Body() payload: CreateBibliotecaItemDto,
  ) {
    return this.bibliotecaService.create(payload, req.user.userId);
  }

  @Get()
  findAll(@Query() query: FindBibliotecaQueryDto) {
    return this.bibliotecaService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bibliotecaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateBibliotecaItemDto) {
    return this.bibliotecaService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bibliotecaService.remove(id);
  }
}
