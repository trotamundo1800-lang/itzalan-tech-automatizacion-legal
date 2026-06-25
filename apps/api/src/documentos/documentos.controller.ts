import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DocumentosService } from './documentos.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { GenerateDocumentDto } from './dto/generate-document.dto';
import { PremiumGuard } from '../subscriptions/premium.guard';
import { PremiumFeature } from '../subscriptions/premium-feature.decorator';

@Controller(['api/documentos', 'documentos'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'abogado', 'asistente')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  create(
    @Request() req: { user: { userId: string } },
    @Body() payload: CreateDocumentDto,
  ) {
    return this.documentosService.create(payload, req.user.userId);
  }

  @Post('generate-word')
  @UseGuards(PremiumGuard)
  @PremiumFeature()
  generateWord(
    @Request() req: { user: { userId: string } },
    @Body() payload: Omit<CreateDocumentDto, 'formato'>,
  ) {
    return this.documentosService.generateWord(payload, req.user.userId);
  }

  @Post('generate-pdf')
  @UseGuards(PremiumGuard)
  @PremiumFeature()
  generatePdf(
    @Request() req: { user: { userId: string } },
    @Body() payload: Omit<CreateDocumentDto, 'formato'>,
  ) {
    return this.documentosService.generatePdf(payload, req.user.userId);
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

  @Post(':id/generar')
  @HttpCode(200)
  async generateFromSaved(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() payload: GenerateDocumentDto,
    @Res() res: Response,
  ) {
    const generated = await this.documentosService.generateFromSaved(id, payload, req.user.userId);
    res.setHeader('Content-Type', generated.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${generated.fileName}"`);
    res.setHeader('X-Generated-History-Id', generated.historyId);
    res.send(generated.buffer);
  }
}
