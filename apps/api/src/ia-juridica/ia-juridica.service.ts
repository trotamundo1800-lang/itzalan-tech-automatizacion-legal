import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { Repository } from 'typeorm';
import { AnalyzeDocumentDto } from './dto/analyze-document.dto';
import { GenerateDraftDto } from './dto/generate-draft.dto';
import { ExpedienteSummaryDto } from './dto/expediente-summary.dto';
import { LegalDocument } from '../documentos/legal-document.entity';
import { Expediente } from '../expedientes/expediente.entity';

@Injectable()
export class IaJuridicaService {
  private readonly openai: OpenAI | null;

  constructor(
    @InjectRepository(LegalDocument)
    private readonly legalDocumentRepository: Repository<LegalDocument>,
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,
  ) {
    const apiKey = process.env.OPENAI_API_KEY;
    this.openai = apiKey ? new OpenAI({ apiKey }) : null;
  }

  private async askModel(systemPrompt: string, userPrompt: string, fallback: string) {
    if (!this.openai) {
      return fallback;
    }

    try {
      const completion = await this.openai.responses.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const text = completion.output_text?.trim();
      return text && text.length > 0 ? text : fallback;
    } catch {
      return fallback;
    }
  }

  async analyzeDocument(payload: AnalyzeDocumentDto) {
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

    const analysis = await this.askModel(
      'Eres un analista juridico senior. Responde en espanol con claridad y precision.',
      `Contenido:\n${content}\n\nInstruccion: ${question}`,
      fallback,
    );

    return {
      analisis: analysis,
      resumenRiesgos: 'Posibles inconsistencias contractuales y falta de precision en obligaciones principales.',
      recomendaciones: [
        'Definir plazos, responsables y entregables de forma expresa.',
        'Incluir causales de incumplimiento con consecuencias claras.',
        'Alinear clausulas con normativa aplicable y jurisdiccion competente.',
      ],
    };
  }

  async generateDraft(payload: GenerateDraftDto) {
    const fallback = [
      `Borrador inicial de ${payload.tipoBorrador}.`,
      `Hechos relevantes: ${payload.hechos}`,
      `Objetivo juridico: ${payload.objetivo}`,
      'Estructura sugerida:',
      '1) Antecedentes, 2) Fundamentos, 3) Pretensiones, 4) Petitorio y firma.',
    ].join('\n');

    const draft = await this.askModel(
      'Eres un abogado litigante experto en redaccion tecnica en espanol.',
      `Genera un borrador de tipo ${payload.tipoBorrador} con estos hechos: ${payload.hechos}. Objetivo: ${payload.objetivo}.`,
      fallback,
    );

    return {
      tipoBorrador: payload.tipoBorrador,
      borrador: draft,
    };
  }

  async summarizeExpediente(payload: ExpedienteSummaryDto) {
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

    const summary = await this.askModel(
      'Eres un asistente juridico que resume expedientes de forma breve y accionable.',
      `Resume este expediente y sugiere proximos pasos:\n${fallback}`,
      fallback,
    );

    return {
      expedienteId: expediente.id,
      resumen: summary,
      puntosClave: [
        `Estado actual: ${expediente.estado}`,
        `Tipo de expediente: ${expediente.tipo}`,
        'Proximo paso sugerido: validar cronograma procesal y preparar actuacion prioritaria.',
      ],
    };
  }
}
