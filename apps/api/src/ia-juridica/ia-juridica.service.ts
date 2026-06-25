import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyzeDocumentDto } from './dto/analyze-document.dto';
import { GenerateDraftDto } from './dto/generate-draft.dto';
import { ExpedienteSummaryDto } from './dto/expediente-summary.dto';
import { VirtualAssistantDto } from './dto/virtual-assistant.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AssociateConversationDto } from './dto/associate-conversation.dto';
import { FindConversationsQueryDto } from './dto/find-conversations-query.dto';
import { LegalDocument } from '../documentos/legal-document.entity';
import { Expediente } from '../expedientes/expediente.entity';
import { Client } from '../clients/client.entity';
import { User } from '../auth/user.entity';
import { AiConversation } from './ai-conversation.entity';
import { AiContextSource } from './ai-context-source.entity';
import { AiMessage, AiMode } from './ai-message.entity';
import { IaProviderService } from './ia-provider.service';
import { SubscriptionQuotaService } from '../subscriptions/subscription-quota.service';

type AssistantTurn = {
  modo: AiMode;
  respuesta: string;
  recomendaciones: string[];
  riesgos: string[];
  proyeccionCaso: string;
  analisis: string;
  contextoAplicado: string;
};

@Injectable()
export class IaJuridicaService {
  constructor(
    @InjectRepository(LegalDocument)
    private readonly legalDocumentRepository: Repository<LegalDocument>,
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AiConversation)
    private readonly aiConversationRepository: Repository<AiConversation>,
    @InjectRepository(AiMessage)
    private readonly aiMessageRepository: Repository<AiMessage>,
    @InjectRepository(AiContextSource)
    private readonly aiContextSourceRepository: Repository<AiContextSource>,
    private readonly iaProviderService: IaProviderService,
    private readonly subscriptionQuotaService: SubscriptionQuotaService,
  ) {
    // noop
  }

  private getAssistantMode(): AiMode {
    return this.iaProviderService.getMode();
  }

  private async askModel(systemPrompt: string, userPrompt: string, fallback: string) {
    return this.iaProviderService.ask(systemPrompt, userPrompt, fallback);
  }

  private buildDerivedInsights(contexto: string, consulta: string) {
    return {
      riesgos: [
        `Falta de precision en hechos y pruebas para el contexto ${contexto}.`,
        'Posible impacto por plazos, cumplimiento o defensa insuficientemente documentada.',
      ],
      recomendaciones: [
        'Ordenar evidencias y documentos fuente antes de accionar.',
        'Definir un siguiente paso verificable con responsable y plazo.',
        'Contrastar la estrategia con normativa y jurisdiccion aplicable.',
      ],
      proyeccionCaso: `Si se valida la base documental de la consulta "${consulta}", el caso puede evolucionar con una ruta mas predecible y menor exposicion operativa.`,
      analisis: `Analisis preliminar del contexto ${contexto}: la consulta requiere verificacion de hechos, soporte documental y definicion clara del objetivo juridico antes de la siguiente actuacion.`,
    };
  }

  private async ensureUserExists(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  private async ensureClientExists(clienteId: string) {
    const client = await this.clientRepository.findOne({ where: { id: clienteId } });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return client;
  }

  private async ensureExpedienteExists(expedienteId: string) {
    const expediente = await this.expedienteRepository.findOne({ where: { id: expedienteId }, relations: { cliente: true } });
    if (!expediente) {
      throw new NotFoundException('Expediente no encontrado');
    }

    return expediente;
  }

  private async syncContextSources(conversation: AiConversation) {
    await this.aiContextSourceRepository.delete({ conversationId: conversation.id });

    const sources: AiContextSource[] = [];

    if (conversation.clienteId && conversation.cliente) {
      sources.push(
        this.aiContextSourceRepository.create({
          conversationId: conversation.id,
          sourceType: 'cliente',
          sourceId: conversation.clienteId,
          label: conversation.cliente.nombre,
          metadata: { email: conversation.cliente.email },
        }),
      );
    }

    if (conversation.expedienteId && conversation.expediente) {
      sources.push(
        this.aiContextSourceRepository.create({
          conversationId: conversation.id,
          sourceType: 'expediente',
          sourceId: conversation.expedienteId,
          label: conversation.expediente.titulo,
          metadata: { estado: conversation.expediente.estado, tipo: conversation.expediente.tipo },
        }),
      );
    }

    if (sources.length > 0) {
      await this.aiContextSourceRepository.save(sources);
    }
  }

  private async findConversationForUser(id: string, userId: string) {
    const conversation = await this.aiConversationRepository.findOne({
      where: { id },
      relations: {
        cliente: true,
        expediente: { cliente: true },
        contextSources: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversacion no encontrada');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta conversacion');
    }

    return conversation;
  }

  private async findMessagesByConversation(conversationId: string) {
    return this.aiMessageRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  private serializeConversation(conversation: AiConversation, orderedMessages: AiMessage[], includeMessages = false) {
    const sortedMessages = [...orderedMessages].sort(
      (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
    const latestMessage = sortedMessages.at(-1) ?? null;

    return {
      id: conversation.id,
      title: conversation.title,
      contextoJuridico: conversation.contextoJuridico,
      userId: conversation.userId,
      clienteId: conversation.clienteId ?? null,
      expedienteId: conversation.expedienteId ?? null,
      cliente: conversation.cliente
        ? {
            id: conversation.cliente.id,
            nombre: conversation.cliente.nombre,
          }
        : null,
      expediente: conversation.expediente
        ? {
            id: conversation.expediente.id,
            titulo: conversation.expediente.titulo,
            estado: conversation.expediente.estado,
          }
        : null,
      contextSources: (conversation.contextSources ?? []).map((source) => ({
        id: source.id,
        sourceType: source.sourceType,
        sourceId: source.sourceId,
        label: source.label,
        metadata: source.metadata ?? null,
        createdAt: source.createdAt,
      })),
      latestMessage: latestMessage
        ? {
            id: latestMessage.id,
            preguntaUsuario: latestMessage.preguntaUsuario,
            respuestaIa: latestMessage.respuestaIa,
            modo: latestMessage.modo,
            contextoJuridico: latestMessage.contextoJuridico,
            analisis: latestMessage.analisis,
            recomendaciones: latestMessage.recomendaciones ?? [],
            riesgos: latestMessage.riesgos ?? [],
            proyeccionCaso: latestMessage.proyeccionCaso,
            createdAt: latestMessage.createdAt,
          }
        : null,
      messagesCount: sortedMessages.length,
      messages: includeMessages
        ? sortedMessages.map((message) => ({
            id: message.id,
            preguntaUsuario: message.preguntaUsuario,
            respuestaIa: message.respuestaIa,
            modo: message.modo,
            contextoJuridico: message.contextoJuridico,
            analisis: message.analisis,
            recomendaciones: message.recomendaciones ?? [],
            riesgos: message.riesgos ?? [],
            proyeccionCaso: message.proyeccionCaso,
            createdAt: message.createdAt,
          }))
        : undefined,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  private async buildAssistantTurn(input: {
    consulta: string;
    contextoJuridico: string;
    detalle?: string;
    conversation?: AiConversation;
  }): Promise<AssistantTurn> {
    const trimmedContext = input.contextoJuridico.trim() || 'general';
    const detail = input.detalle?.trim();
    const relatedClient = input.conversation?.cliente ? `Cliente: ${input.conversation.cliente.nombre}.` : '';
    const relatedExpediente = input.conversation?.expediente
      ? `Expediente: ${input.conversation.expediente.titulo} (${input.conversation.expediente.estado}).`
      : '';
    const previousTurns = (input.conversation?.messages ?? [])
      .slice(-3)
      .map((message, index) => `Turno ${index + 1}: usuario=${message.preguntaUsuario}; ia=${message.respuestaIa}`)
      .join('\n');
    const derived = this.buildDerivedInsights(trimmedContext, input.consulta);
    const fallback = [
      'Asistente virtual en modo local (fallback).',
      `Contexto juridico: ${trimmedContext}.`,
      relatedClient,
      relatedExpediente,
      `Consulta: ${input.consulta}`,
      detail ? `Detalle adicional: ${detail}` : '',
      derived.analisis,
      `Proyeccion del caso: ${derived.proyeccionCaso}`,
    ]
      .filter(Boolean)
      .join('\n');

    const modelResult = await this.askModel(
      'Eres un asistente juridico virtual para abogados. Responde en espanol, con tono profesional, accionable y sin inventar hechos.',
      [
        `Contexto juridico principal: ${trimmedContext}`,
        relatedClient,
        relatedExpediente,
        previousTurns ? `Historial reciente:\n${previousTurns}` : 'Sin historial previo.',
        detail ? `Detalle adicional: ${detail}` : 'Sin detalle adicional.',
        `Consulta actual: ${input.consulta}`,
        'Devuelve una respuesta preliminar con enfoque practico, riesgos y siguientes pasos.',
      ]
        .filter(Boolean)
        .join('\n\n'),
      fallback,
    );

    return {
      modo: modelResult.mode,
      respuesta: modelResult.text,
      recomendaciones: derived.recomendaciones,
      riesgos: derived.riesgos,
      proyeccionCaso: derived.proyeccionCaso,
      analisis: derived.analisis,
      contextoAplicado: trimmedContext,
    };
  }

  async listConversations(userId: string, filters?: FindConversationsQueryDto) {
    const conversations = await this.aiConversationRepository.find({
      where: {
        userId,
        ...(filters?.clienteId ? { clienteId: filters.clienteId } : {}),
        ...(filters?.expedienteId ? { expedienteId: filters.expedienteId } : {}),
      },
      relations: {
        cliente: true,
        expediente: true,
        contextSources: true,
      },
      order: { updatedAt: 'DESC' },
    });

    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => ({
        conversation,
        messages: await this.findMessagesByConversation(conversation.id),
      })),
    );

    return conversationsWithMessages.map((item) => this.serializeConversation(item.conversation, item.messages));
  }

  async createConversation(userId: string, payload: CreateConversationDto) {
    const user = await this.ensureUserExists(userId);
    let cliente = payload.clienteId ? await this.ensureClientExists(payload.clienteId) : null;
    let expediente = payload.expedienteId ? await this.ensureExpedienteExists(payload.expedienteId) : null;

    if (expediente && !cliente) {
      cliente = expediente.cliente;
    }

    if (expediente && cliente && expediente.clienteId !== cliente.id) {
      throw new BadRequestException('El expediente seleccionado no corresponde al cliente indicado');
    }

    const conversation = this.aiConversationRepository.create({
      title: payload.title?.trim() || `Conversacion IA ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
      contextoJuridico: payload.contextoJuridico?.trim() || 'general',
      userId: user.id,
      clienteId: cliente?.id ?? null,
      expedienteId: expediente?.id ?? null,
      cliente,
      expediente,
    });

    const saved = await this.aiConversationRepository.save(conversation);
    const hydrated = await this.findConversationForUser(saved.id, userId);
    await this.syncContextSources(hydrated);

    const refreshed = await this.findConversationForUser(saved.id, userId);
    const messages = await this.findMessagesByConversation(refreshed.id);
    return this.serializeConversation(refreshed, messages, true);
  }

  async getConversationHistory(id: string, userId: string) {
    const conversation = await this.findConversationForUser(id, userId);
    const messages = await this.findMessagesByConversation(conversation.id);
    return this.serializeConversation(conversation, messages, true);
  }

  async associateConversation(id: string, userId: string, payload: AssociateConversationDto) {
    const conversation = await this.findConversationForUser(id, userId);
    const expediente = payload.expedienteId ? await this.ensureExpedienteExists(payload.expedienteId) : null;
    const cliente = payload.clienteId ? await this.ensureClientExists(payload.clienteId) : expediente?.cliente ?? null;

    if (expediente && cliente && expediente.clienteId !== cliente.id) {
      throw new BadRequestException('El expediente seleccionado no corresponde al cliente indicado');
    }

    conversation.expedienteId = expediente?.id ?? null;
    conversation.expediente = expediente;
    conversation.clienteId = cliente?.id ?? null;
    conversation.cliente = cliente;

    await this.aiConversationRepository.save(conversation);
    await this.syncContextSources(conversation);

    const refreshed = await this.findConversationForUser(id, userId);
    const messages = await this.findMessagesByConversation(refreshed.id);
    return this.serializeConversation(refreshed, messages, true);
  }

  async sendMessage(id: string, userId: string, payload: SendMessageDto) {
    const conversation = await this.findConversationForUser(id, userId);
    const currentMessages = await this.findMessagesByConversation(conversation.id);
    const turn = await this.buildAssistantTurn({
      consulta: payload.pregunta,
      contextoJuridico: payload.contextoJuridico ?? conversation.contextoJuridico,
      conversation: {
        ...conversation,
        messages: currentMessages,
      } as AiConversation,
    });

    const message = this.aiMessageRepository.create({
      conversation: { id: conversation.id } as AiConversation,
      preguntaUsuario: payload.pregunta.trim(),
      respuestaIa: turn.respuesta,
      modo: turn.modo,
      contextoJuridico: turn.contextoAplicado,
      analisis: turn.analisis,
      recomendaciones: turn.recomendaciones,
      riesgos: turn.riesgos,
      proyeccionCaso: turn.proyeccionCaso,
    });

    await this.aiMessageRepository.save(message);
    conversation.contextoJuridico = turn.contextoAplicado;
    await this.aiConversationRepository.save(conversation);

    const refreshed = await this.findConversationForUser(id, userId);
    const messages = await this.findMessagesByConversation(refreshed.id);
    return this.serializeConversation(refreshed, messages, true);
  }

  private buildPromptByAnalysisType(
    tipo: NonNullable<VirtualAssistantDto['tipoAnalisis']>,
    input: { consulta: string; contexto: string; detalle?: string },
  ) {
    const base = [
      `Consulta: ${input.consulta}`,
      `Contexto: ${input.contexto}`,
      input.detalle ? `Detalle: ${input.detalle}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const map: Record<NonNullable<VirtualAssistantDto['tipoAnalisis']>, string> = {
      analisis_juridico: `${base}\n\nRealiza analisis juridico estructurado: hechos relevantes, norma aplicable, riesgos y siguientes pasos.`,
      resumen: `${base}\n\nGenera resumen ejecutivo juridico breve y accionable.`,
      riesgos_legales: `${base}\n\nIdentifica riesgos legales priorizados y medidas de mitigacion concretas.`,
      estrategia_juridica: `${base}\n\nPropone estrategia juridica por fases con objetivos y acciones inmediatas.`,
      redaccion_documental: `${base}\n\nRedacta un borrador documental juridico inicial con estructura profesional.`,
      probabilidad_exito: `${base}\n\nEstima probabilidad de exito preliminar y variables criticas que la afectan.`,
    };

    return map[tipo];
  }

  async virtualAssistant(userId: string, payload: VirtualAssistantDto) {
    await this.ensureUserExists(userId);
    await this.subscriptionQuotaService.assertAiLimit(userId);

    const tipoAnalisis = payload.tipoAnalisis ?? 'analisis_juridico';
    const turn = await this.buildAssistantTurn({
      consulta: payload.consulta,
      contextoJuridico: payload.contexto ?? 'general',
      detalle: payload.detalle,
    });

    const openAiResult = await this.askModel(
      'Eres un asistente juridico senior. Responde en espanol profesional, con criterios legales y accionables.',
      this.buildPromptByAnalysisType(tipoAnalisis, {
        consulta: payload.consulta,
        contexto: payload.contexto ?? 'general',
        detalle: payload.detalle,
      }),
      turn.respuesta,
    );

    const conversation = this.aiConversationRepository.create({
      title: `Consulta IA ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
      contextoJuridico: payload.contexto ?? 'general',
      userId,
      clienteId: null,
      expedienteId: null,
    });
    const savedConversation = await this.aiConversationRepository.save(conversation);

    const message = this.aiMessageRepository.create({
      conversation: { id: savedConversation.id } as AiConversation,
      preguntaUsuario: payload.consulta.trim(),
      respuestaIa: openAiResult.text,
      modo: openAiResult.mode,
      contextoJuridico: payload.contexto ?? 'general',
      analisis: turn.analisis,
      recomendaciones: turn.recomendaciones,
      riesgos: turn.riesgos,
      proyeccionCaso: turn.proyeccionCaso,
    });
    await this.aiMessageRepository.save(message);

    return {
      modo: openAiResult.mode,
      respuesta: openAiResult.text,
      tipoAnalisis,
      accionesSugeridas: turn.recomendaciones,
      riesgos: turn.riesgos,
      proyeccionCaso: turn.proyeccionCaso,
      analisis: turn.analisis,
      contextoJuridico: turn.contextoAplicado,
      consultaId: savedConversation.id,
    };
  }

  async getRecentHistory(userId: string, limit = 20) {
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20;
    const conversations = await this.aiConversationRepository.find({
      where: { userId },
      relations: { messages: true },
      order: { updatedAt: 'DESC' },
      take: safeLimit,
    });

    return conversations.map((conversation) => {
      const latest = [...(conversation.messages ?? [])].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      )[0];

      return {
        id: conversation.id,
        consulta: latest?.preguntaUsuario ?? '',
        respuesta: latest?.respuestaIa ?? '',
        fecha: latest?.createdAt ?? conversation.createdAt,
        usuarioId: conversation.userId,
        contextoJuridico: conversation.contextoJuridico,
        modo: latest?.modo ?? 'local',
      };
    });
  }

  async analyzeDocument(userId: string, payload: AnalyzeDocumentDto) {
    await this.ensureUserExists(userId);
    await this.subscriptionQuotaService.assertAiLimit(userId);
    let content = payload.contenido?.trim() || '';

    if (payload.documentoId) {
      const doc = await this.legalDocumentRepository.findOne({ where: { id: payload.documentoId } });
      if (!doc) {
        throw new NotFoundException('Documento no encontrado');
      }

      content = doc.contenidoTexto;
    }

    if (content.length < 20) {
      throw new BadRequestException('Se requiere contenido suficiente para analizar el documento');
    }

    const question = payload.pregunta ?? 'Identifica riesgos, obligaciones y recomendaciones jurídicas.';
    const fallback = [
      'Analisis juridico preliminar generado localmente.',
      `Pregunta guia: ${question}`,
      'Riesgos detectados: ambiguedad en obligaciones, ausencia de plazos detallados y vacios de cumplimiento.',
      'Recomendaciones: precisar terminos, incorporar penalidades y reforzar clausula de resolucion de controversias.',
    ].join('\n');

    const analysisResult = await this.askModel(
      'Eres un analista juridico senior. Responde en espanol con claridad y precision.',
      `Contenido:\n${content}\n\nInstruccion: ${question}`,
      fallback,
    );

    return {
      modo: analysisResult.mode,
      analisis: analysisResult.text,
      resumenRiesgos: 'Posibles inconsistencias contractuales y falta de precision en obligaciones principales.',
      recomendaciones: [
        'Definir plazos, responsables y entregables de forma expresa.',
        'Incluir causales de incumplimiento con consecuencias claras.',
        'Alinear clausulas con normativa aplicable y jurisdiccion competente.',
      ],
    };
  }

  async generateDraft(userId: string, payload: GenerateDraftDto) {
    await this.ensureUserExists(userId);
    await this.subscriptionQuotaService.assertAiLimit(userId);
    const fallback = [
      `Borrador inicial de ${payload.tipoBorrador}.`,
      `Hechos relevantes: ${payload.hechos}`,
      `Objetivo juridico: ${payload.objetivo}`,
      'Estructura sugerida:',
      '1) Antecedentes, 2) Fundamentos, 3) Pretensiones, 4) Petitorio y firma.',
    ].join('\n');

    const draftResult = await this.askModel(
      'Eres un abogado litigante experto en redaccion tecnica en espanol.',
      `Genera un borrador de tipo ${payload.tipoBorrador} con estos hechos: ${payload.hechos}. Objetivo: ${payload.objetivo}.`,
      fallback,
    );

    return {
      modo: draftResult.mode,
      tipoBorrador: payload.tipoBorrador,
      borrador: draftResult.text,
    };
  }

  async summarizeExpediente(userId: string, payload: ExpedienteSummaryDto) {
    await this.ensureUserExists(userId);
    await this.subscriptionQuotaService.assertAiLimit(userId);
    const expediente = await this.expedienteRepository.findOne({
      where: { id: payload.expedienteId },
      relations: { cliente: true },
    });

    if (!expediente) {
      throw new NotFoundException('Expediente no encontrado');
    }

    const fallback = [
      `Expediente: ${expediente.titulo}`,
      `Cliente: ${expediente.cliente?.nombre ?? 'Sin cliente'}`,
      `Estado: ${expediente.estado}`,
      `Descripcion: ${expediente.descripcion}`,
      'Resumen: Caso en seguimiento con hitos pendientes de validacion probatoria y control de plazos.',
    ].join('\n');

    const summaryResult = await this.askModel(
      'Eres un asistente juridico que resume expedientes de forma breve y accionable.',
      `Resume este expediente y sugiere proximos pasos:\n${fallback}`,
      fallback,
    );

    return {
      modo: summaryResult.mode,
      expedienteId: expediente.id,
      resumen: summaryResult.text,
      puntosClave: [
        `Estado actual: ${expediente.estado}`,
        `Tipo de expediente: ${expediente.tipo}`,
        'Proximo paso sugerido: validar cronograma procesal y preparar actuacion prioritaria.',
      ],
    };
  }
}
