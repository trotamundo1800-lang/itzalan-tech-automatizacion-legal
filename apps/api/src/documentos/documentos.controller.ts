import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DocumentosService } from './documentos.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PremiumGuard } from '../subscriptions/premium.guard';
import { PremiumFeature } from '../subscriptions/premium-feature.decorator';

@Controller('api/documentos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'abogado', 'asistente')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  create(@Body() payload: CreateDocumentDto) {
    return this.documentosService.create(payload);
  }

  @Post('generate-word')
  @UseGuards(PremiumGuard)
  @PremiumFeature()
  generateWord(@Body() payload: Omit<CreateDocumentDto, 'formato'>) {
    return this.documentosService.generateWord(payload);
  }

  @Post('generate-pdf')
  @UseGuards(PremiumGuard)
  @PremiumFeature()
  generatePdf(@Body() payload: Omit<CreateDocumentDto, 'formato'>) {
    return this.documentosService.generatePdf(payload);
  }

  @Get()
  findAll() {
    return this.documentosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateDocumentDto) {
    return this.documentosService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentosService.remove(id);
  }
}
