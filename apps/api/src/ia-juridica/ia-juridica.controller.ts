import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IaJuridicaService } from './ia-juridica.service';
import { AnalyzeDocumentDto } from './dto/analyze-document.dto';
import { GenerateDraftDto } from './dto/generate-draft.dto';
import { ExpedienteSummaryDto } from './dto/expediente-summary.dto';
import { PremiumGuard } from '../subscriptions/premium.guard';
import { PremiumFeature } from '../subscriptions/premium-feature.decorator';

@Controller('api/ia-juridica')
@UseGuards(JwtAuthGuard, RolesGuard, PremiumGuard)
@Roles('admin', 'abogado', 'asistente')
@PremiumFeature()
export class IaJuridicaController {
  constructor(private readonly iaJuridicaService: IaJuridicaService) {}

  @Post('analizar-documento')
  analyzeDocument(@Body() payload: AnalyzeDocumentDto) {
    return this.iaJuridicaService.analyzeDocument(payload);
  }

  @Post('generar-borrador')
  generateDraft(@Body() payload: GenerateDraftDto) {
    return this.iaJuridicaService.generateDraft(payload);
  }

  @Post('resumen-expediente')
  summarizeExpediente(@Body() payload: ExpedienteSummaryDto) {
    return this.iaJuridicaService.summarizeExpediente(payload);
  }
}
