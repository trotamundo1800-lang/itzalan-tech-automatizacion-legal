import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { FindExpedientesQueryDto } from './dto/find-expedientes-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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
  findAll(@Query() query: FindExpedientesQueryDto) {
    return this.expedientesService.findAll(query);
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
