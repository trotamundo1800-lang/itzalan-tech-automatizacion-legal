import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ExpedienteEstado } from './expediente.entity';

@Controller('api/expedientes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'abogado', 'asistente')
export class ExpedientesController {
  constructor(private readonly expedientesService: ExpedientesService) {}

  @Post()
  create(@Body() payload: CreateExpedienteDto) {
    return this.expedientesService.create(payload);
  }

  @Get()
  findAll(@Query('clienteId') clienteId?: string, @Query('estado') estado?: string) {
    return this.expedientesService.findAll({ clienteId, estado: estado as ExpedienteEstado });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expedientesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateExpedienteDto) {
    return this.expedientesService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expedientesService.remove(id);
  }
}
