import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AgendaService } from './agenda.service';
import { CreateAgendaEventDto } from './dto/create-agenda-event.dto';
import { UpdateAgendaEventDto } from './dto/update-agenda-event.dto';

@Controller('api/agenda')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'abogado', 'asistente')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Post()
  create(@Body() payload: CreateAgendaEventDto) {
    return this.agendaService.create(payload);
  }

  @Get()
  findAll() {
    return this.agendaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agendaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateAgendaEventDto) {
    return this.agendaService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agendaService.remove(id);
  }
}
