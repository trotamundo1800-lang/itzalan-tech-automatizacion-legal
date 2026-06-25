import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { Client } from '../clients/client.entity';
import { Expediente } from '../expedientes/expediente.entity';
import { LegalDocument } from '../documentos/legal-document.entity';
import { DocumentGeneration } from '../documentos/document-generation.entity';
import { AiConversation } from '../ia-juridica/ai-conversation.entity';

type PlanQuota = {
  maxClients: number | null;
  maxExpedientes: number | null;
  maxDocuments: number | null;
  maxAiQueries: number | null;
};

const PLAN_QUOTAS: Record<string, PlanQuota> = {
  basic: { maxClients: 5, maxExpedientes: 5, maxDocuments: 20, maxAiQueries: 100 },
  professional: { maxClients: 50, maxExpedientes: 50, maxDocuments: 100, maxAiQueries: 1000 },
  business: { maxClients: 500, maxExpedientes: 500, maxDocuments: 500, maxAiQueries: 5000 },
  enterprise: { maxClients: null, maxExpedientes: null, maxDocuments: null, maxAiQueries: null },
};

@Injectable()
export class SubscriptionQuotaService {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,
    @InjectRepository(LegalDocument)
    private readonly documentRepository: Repository<LegalDocument>,
    @InjectRepository(DocumentGeneration)
    private readonly documentGenerationRepository: Repository<DocumentGeneration>,
    @InjectRepository(AiConversation)
    private readonly aiConversationRepository: Repository<AiConversation>,
  ) {}

  private async getPlanQuota(userId: string) {
    const summary = await this.subscriptionsService.getUserSubscription(userId);
    if (!summary.isActive || !summary.subscription?.plan) {
      throw new ForbiddenException('Se requiere suscripción activa para esta función');
    }

    const quota = PLAN_QUOTAS[summary.subscription.plan.code] ?? PLAN_QUOTAS.basic;

    return {
      planName: summary.subscription.plan.name,
      planCode: summary.subscription.plan.code,
      quota,
    };
  }

  private throwQuotaExceeded(label: string, limit: number | null) {
    const limitLabel = limit === null ? 'ilimitado' : String(limit);
    throw new ForbiddenException(`Has alcanzado el límite de ${label} de tu plan (${limitLabel}).`);
  }

  async assertClientLimit(userId: string) {
    const { quota } = await this.getPlanQuota(userId);
    if (quota.maxClients === null) {
      return;
    }

    const current = await this.clientRepository.count({ where: { createdByUserId: userId } });
    if (current >= quota.maxClients) {
      this.throwQuotaExceeded('clientes', quota.maxClients);
    }
  }

  async assertExpedienteLimit(userId: string) {
    const { quota } = await this.getPlanQuota(userId);
    if (quota.maxExpedientes === null) {
      return;
    }

    const current = await this.expedienteRepository.count({ where: { createdByUserId: userId } });
    if (current >= quota.maxExpedientes) {
      this.throwQuotaExceeded('expedientes', quota.maxExpedientes);
    }
  }

  async assertDocumentLimit(userId: string) {
    const { quota } = await this.getPlanQuota(userId);
    if (quota.maxDocuments === null) {
      return;
    }

    const createdDocuments = await this.documentRepository.count({ where: { createdByUserId: userId } });
    const generatedDocuments = await this.documentGenerationRepository
      .createQueryBuilder('generation')
      .innerJoin('generation.document', 'document')
      .where('document.createdByUserId = :userId', { userId })
      .getCount();

    if (createdDocuments + generatedDocuments >= quota.maxDocuments) {
      this.throwQuotaExceeded('documentos', quota.maxDocuments);
    }
  }

  async assertAiLimit(userId: string) {
    const { quota } = await this.getPlanQuota(userId);
    if (quota.maxAiQueries === null) {
      return;
    }

    const current = await this.aiConversationRepository.count({ where: { userId } });
    if (current >= quota.maxAiQueries) {
      this.throwQuotaExceeded('consultas de IA', quota.maxAiQueries);
    }
  }
}