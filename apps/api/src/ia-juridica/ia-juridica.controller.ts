import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IaJuridicaService } from './ia-juridica.service';
import { AnalyzeDocumentDto } from './dto/analyze-document.dto';
import { GenerateDraftDto } from './dto/generate-draft.dto';
import { ExpedienteSummaryDto } from './dto/expediente-summary.dto';
import { VirtualAssistantDto } from './dto/virtual-assistant.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AssociateConversationDto } from './dto/associate-conversation.dto';
import { FindConversationsQueryDto } from './dto/find-conversations-query.dto';
import { PremiumGuard } from '../subscriptions/premium.guard';
import { PremiumFeature } from '../subscriptions/premium-feature.decorator';

@Controller('api/ia-juridica')
@UseGuards(JwtAuthGuard, RolesGuard, PremiumGuard)
@Roles('admin', 'abogado', 'asistente')
@PremiumFeature()
export class IaJuridicaController {
  constructor(private readonly iaJuridicaService: IaJuridicaService) {}

  @Get('historial')
  getHistorial(
    @Request()
    req: { user: { userId: string } },
    @Query('limit') limit?: string,
  ) {
    return this.iaJuridicaService.getRecentHistory(req.user.userId, limit ? Number(limit) : 20);
  }

  @Get('conversations')
  listConversations(
    @Request()
    req: { user: { userId: string } },
    @Query() query: FindConversationsQueryDto,
  ) {
    return this.iaJuridicaService.listConversations(req.user.userId, query);
  }

  @Post('conversations')
  createConversation(
    @Request()
    req: { user: { userId: string } },
    @Body() payload: CreateConversationDto,
  ) {
    return this.iaJuridicaService.createConversation(req.user.userId, payload);
  }

  @Get('conversations/:id')
  getConversation(
    @Request()
    req: { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.iaJuridicaService.getConversationHistory(id, req.user.userId);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Request()
    req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() payload: SendMessageDto,
  ) {
    return this.iaJuridicaService.sendMessage(id, req.user.userId, payload);
  }

  @Patch('conversations/:id/associations')
  associateConversation(
    @Request()
    req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() payload: AssociateConversationDto,
  ) {
    return this.iaJuridicaService.associateConversation(id, req.user.userId, payload);
  }

  @Post('consultar')
  virtualAssistant(
    @Request()
    req: { user: { userId: string } },
    @Body() payload: VirtualAssistantDto,
  ) {
    return this.iaJuridicaService.virtualAssistant(req.user.userId, payload);
  }

  @Post('analizar-documento')
  analyzeDocument(
    @Request() req: { user: { userId: string } },
    @Body() payload: AnalyzeDocumentDto,
  ) {
    return this.iaJuridicaService.analyzeDocument(req.user.userId, payload);
  }

  @Post('generar-borrador')
  generateDraft(
    @Request() req: { user: { userId: string } },
    @Body() payload: GenerateDraftDto,
  ) {
    return this.iaJuridicaService.generateDraft(req.user.userId, payload);
  }

  @Post('resumen-expediente')
  summarizeExpediente(
    @Request() req: { user: { userId: string } },
    @Body() payload: ExpedienteSummaryDto,
  ) {
    return this.iaJuridicaService.summarizeExpediente(req.user.userId, payload);
  }
}
