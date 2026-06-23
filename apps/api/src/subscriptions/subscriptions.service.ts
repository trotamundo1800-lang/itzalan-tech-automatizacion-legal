import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { UserSubscription } from './user-subscription.entity';
import { PaymentTransaction } from './payment-transaction.entity';
import { CheckoutSubscriptionDto } from './dto/checkout-subscription.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class SubscriptionsService implements OnModuleInit {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepository: Repository<UserSubscription>,
    @InjectRepository(PaymentTransaction)
    private readonly paymentRepository: Repository<PaymentTransaction>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultPlans();
  }

  private async ensureDefaultPlans() {
    const defaults = [
      {
        code: 'basic',
        name: 'Plan Básico',
        description: 'Acceso inicial a funciones legales con soporte documental y operación estándar.',
        monthlyPrice: 19,
      },
      {
        code: 'professional',
        name: 'Plan Profesional',
        description: 'Mayor capacidad operativa, automatización y prioridad para equipos jurídicos en crecimiento.',
        monthlyPrice: 49,
      },
      {
        code: 'business',
        name: 'Plan Empresarial',
        description: 'Cobertura completa con soporte premium y enfoque colaborativo multiusuario.',
        monthlyPrice: 99,
      },
    ];

    for (const item of defaults) {
      const existing = await this.planRepository.findOne({ where: { code: item.code } });
      if (existing) {
        continue;
      }

      const plan = this.planRepository.create({
        ...item,
        currency: 'USD',
        isActive: true,
        enablesPremiumFeatures: true,
      });

      await this.planRepository.save(plan);
    }
  }

  findPlans(includeInactive = false) {
    return this.planRepository.find({
      where: includeInactive ? {} : { isActive: true },
      order: { monthlyPrice: 'ASC' },
    });
  }

  async findPlanById(planId: string) {
    const plan = await this.planRepository.findOne({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException('Plan no encontrado');
    }

    return plan;
  }

  async createPlan(payload: CreatePlanDto) {
    const existing = await this.planRepository.findOne({ where: { code: payload.code } });
    if (existing) {
      throw new BadRequestException('Ya existe un plan con ese código');
    }

    const plan = this.planRepository.create({
      code: payload.code.trim().toLowerCase(),
      name: payload.name.trim(),
      description: payload.description.trim(),
      monthlyPrice: payload.monthlyPrice,
      currency: (payload.currency || 'USD').toUpperCase(),
      isActive: payload.isActive ?? true,
      enablesPremiumFeatures: payload.enablesPremiumFeatures ?? true,
    });

    return this.planRepository.save(plan);
  }

  async updatePlan(planId: string, payload: UpdatePlanDto) {
    const plan = await this.findPlanById(planId);

    Object.assign(plan, {
      code: payload.code ? payload.code.trim().toLowerCase() : plan.code,
      name: payload.name?.trim() ?? plan.name,
      description: payload.description?.trim() ?? plan.description,
      monthlyPrice: payload.monthlyPrice ?? plan.monthlyPrice,
      currency: payload.currency ? payload.currency.toUpperCase() : plan.currency,
      isActive: payload.isActive ?? plan.isActive,
      enablesPremiumFeatures: payload.enablesPremiumFeatures ?? plan.enablesPremiumFeatures,
    });

    return this.planRepository.save(plan);
  }

  async getUserSubscription(userId: string) {
    const subscription = await this.userSubscriptionRepository.findOne({
      where: { userId },
      relations: { plan: true },
      order: { createdAt: 'DESC' },
    });

    if (!subscription) {
      return {
        hasSubscription: false,
        isActive: false,
        subscription: null,
      };
    }

    const now = Date.now();
    const isActive = subscription.status === 'active' && new Date(subscription.endsAt).getTime() > now;

    return {
      hasSubscription: true,
      isActive,
      subscription,
    };
  }

  async hasActiveSubscription(userId: string) {
    const summary = await this.getUserSubscription(userId);
    return summary.isActive;
  }

  private async startCheckout(userId: string, payload: CheckoutSubscriptionDto, provider: 'stripe' | 'paypal') {
    const plan = await this.findPlanById(payload.planId);
    if (!plan.isActive) {
      throw new BadRequestException('El plan seleccionado no está disponible');
    }

    const transaction = this.paymentRepository.create({
      userId,
      planId: plan.id,
      provider,
      status: 'completed',
      amount: plan.monthlyPrice,
      currency: plan.currency,
      externalPaymentId: `${provider.toUpperCase()}-${Date.now()}`,
    });

    await this.paymentRepository.save(transaction);

    const activeSubscriptions = await this.userSubscriptionRepository.find({
      where: { userId, status: 'active' },
    });

    if (activeSubscriptions.length > 0) {
      for (const item of activeSubscriptions) {
        item.status = 'cancelled';
        item.endsAt = new Date();
      }
      await this.userSubscriptionRepository.save(activeSubscriptions);
    }

    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setDate(endsAt.getDate() + 30);

    const subscription = this.userSubscriptionRepository.create({
      userId,
      planId: plan.id,
      provider,
      status: 'active',
      startsAt,
      endsAt,
      autoRenew: true,
      externalSubscriptionId: `${provider.toUpperCase()}-SUB-${Date.now()}`,
    });

    const savedSubscription = await this.userSubscriptionRepository.save(subscription);

    return {
      message: `Suscripción activada con ${provider === 'stripe' ? 'Stripe' : 'PayPal'}`,
      provider,
      checkoutMode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
      payment: transaction,
      subscription: savedSubscription,
      plan,
    };
  }

  checkoutWithStripe(userId: string, payload: CheckoutSubscriptionDto) {
    return this.startCheckout(userId, payload, 'stripe');
  }

  checkoutWithPaypal(userId: string, payload: CheckoutSubscriptionDto) {
    return this.startCheckout(userId, payload, 'paypal');
  }

  async cancelCurrentSubscription(userId: string) {
    const current = await this.userSubscriptionRepository.findOne({
      where: { userId, status: 'active' },
      order: { createdAt: 'DESC' },
    });

    if (!current) {
      return { message: 'No hay suscripción activa para cancelar' };
    }

    current.status = 'cancelled';
    current.endsAt = new Date();
    await this.userSubscriptionRepository.save(current);

    return { message: 'Suscripción cancelada' };
  }

  listUserSubscriptions() {
    return this.userSubscriptionRepository.find({
      relations: { plan: true, user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async updateSubscriptionStatus(subscriptionId: string, status: 'active' | 'past_due' | 'cancelled' | 'expired') {
    const subscription = await this.userSubscriptionRepository.findOne({ where: { id: subscriptionId } });
    if (!subscription) {
      throw new NotFoundException('Suscripción no encontrada');
    }

    subscription.status = status;
    if (status === 'cancelled' || status === 'expired') {
      subscription.endsAt = new Date();
    }

    return this.userSubscriptionRepository.save(subscription);
  }
}
