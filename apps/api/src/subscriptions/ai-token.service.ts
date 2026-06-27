import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { AiTokenConsumption, AiTokenType } from './ai-token-consumption.entity';
import { UserSubscription } from './user-subscription.entity';

type PlanTokenAllocation = {
  monthlyTokens: number | null;
  costPerToken: number;
};

const PLAN_TOKEN_ALLOCATION: Record<string, PlanTokenAllocation> = {
  basic: { monthlyTokens: 10000, costPerToken: 0.01 },
  professional: { monthlyTokens: 50000, costPerToken: 0.008 },
  business: { monthlyTokens: 200000, costPerToken: 0.005 },
  enterprise: { monthlyTokens: null, costPerToken: 0.001 },
};

const TOKEN_COSTS: Record<AiTokenType, number> = {
  consultation: 500,
  document_analysis: 1500,
  contract_generation: 3000,
  expediente_summary: 2000,
  conversation: 750,
};

@Injectable()
export class AiTokenService {
  private readonly logger = new Logger(AiTokenService.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    @InjectRepository(AiTokenConsumption)
    private readonly tokenConsumptionRepository: Repository<AiTokenConsumption>,
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepository: Repository<UserSubscription>,
  ) {}

  private getTokenAllocation(planCode: string): PlanTokenAllocation {
    return PLAN_TOKEN_ALLOCATION[planCode] ?? PLAN_TOKEN_ALLOCATION.basic;
  }

  private getTokenCost(type: AiTokenType): number {
    return TOKEN_COSTS[type] ?? 500;
  }

  async getMonthllyAllocation(userId: string): Promise<{
    totalTokens: number | null;
    usedTokens: number;
    remainingTokens: number | null;
    percentage: number;
  }> {
    const summary = await this.subscriptionsService.getUserSubscription(userId);
    if (!summary.isActive || !summary.subscription?.plan) {
      throw new ForbiddenException('Se requiere suscripción activa para usar IA');
    }

    const allocation = this.getTokenAllocation(summary.subscription.plan.code);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usedTokens = await this.tokenConsumptionRepository
      .createQueryBuilder('consumption')
      .where('consumption.userId = :userId', { userId })
      .andWhere('consumption.createdAt >= :monthStart', { monthStart })
      .andWhere('consumption.createdAt <= :monthEnd', { monthEnd })
      .select('SUM(consumption.tokensConsumed)', 'total')
      .getRawOne();

    const used = usedTokens?.total ?? 0;
    const total = allocation.monthlyTokens;
    const remaining = total === null ? null : total - used;
    const percentage = total === null ? 0 : Math.round((used / total) * 100);

    return {
      totalTokens: total,
      usedTokens: used,
      remainingTokens: remaining,
      percentage,
    };
  }

  async assertTokensAvailable(userId: string, type: AiTokenType): Promise<void> {
    const summary = await this.subscriptionsService.getUserSubscription(userId);
    
    // Permitir acceso en modo trial si no hay suscripción activa
    if (!summary.isActive || !summary.subscription?.plan) {
      this.logger.warn(`IA access in trial mode for user ${userId} (no active subscription)`);
      return;
    }

    const allocation = this.getTokenAllocation(summary.subscription.plan.code);
    if (allocation.monthlyTokens === null) {
      return;
    }

    const cost = this.getTokenCost(type);
    const usage = await this.getMonthllyAllocation(userId);

    if (usage.remainingTokens !== null && usage.remainingTokens < cost) {
      throw new ForbiddenException(
        `Tokens de IA insuficientes. Necesitas ${cost} tokens pero solo tienes ${usage.remainingTokens} disponibles. Actualiza tu plan.`,
      );
    }
  }

  async consumeTokens(
    userId: string,
    type: AiTokenType,
    tokensConsumed: number,
    provider: 'anthropic' | 'openai' | 'local',
    model?: string,
    description?: string,
    relatedDocumentId?: string,
    relatedExpedienteId?: string,
    relatedConversationId?: string,
  ): Promise<AiTokenConsumption> {
    const summary = await this.subscriptionsService.getUserSubscription(userId);
    
    // En modo trial, registrar consumo pero con 0 tokens reales
    const actualTokens = summary.isActive && summary.subscription?.plan ? tokensConsumed : 0;
    const mode = summary.isActive && summary.subscription?.plan ? 'subscribed' : 'trial';

    const consumption = this.tokenConsumptionRepository.create({
      userId,
      type,
      tokensConsumed: actualTokens,
      provider,
      model,
      description: description ? `[${mode}] ${description}` : null,
      relatedDocumentId,
      relatedExpedienteId,
      relatedConversationId,
    });

    const saved = await this.tokenConsumptionRepository.save(consumption);
    this.logger.log(
      `IA tokens consumed by ${userId} (${mode}): type=${type} tokens=${actualTokens} provider=${provider} model=${model}`,
    );

    return saved;
  }

  async getConsumptionHistory(
    userId: string,
    limit: number = 50,
  ): Promise<{
    history: AiTokenConsumption[];
    summary: {
      totalTokens: number | null;
      usedTokens: number;
      remainingTokens: number | null;
      percentage: number;
    };
  }> {
    const history = await this.tokenConsumptionRepository
      .createQueryBuilder('consumption')
      .where('consumption.userId = :userId', { userId })
      .orderBy('consumption.createdAt', 'DESC')
      .take(limit)
      .getMany();

    const summary = await this.getMonthllyAllocation(userId);

    return { history, summary };
  }
}
