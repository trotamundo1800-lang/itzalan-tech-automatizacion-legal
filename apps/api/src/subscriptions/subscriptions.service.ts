import { BadRequestException, Injectable, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { UserSubscription } from './user-subscription.entity';
import { PaymentTransaction } from './payment-transaction.entity';
import { CheckoutSubscriptionDto } from './dto/checkout-subscription.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { SubscriptionStatus } from './user-subscription.entity';

type PlanLimits = {
  label: string;
  items: string[];
};

type PayPalWebhookHeaders = Record<string, string | string[] | undefined>;

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
        description: 'Ideal para abogados independientes. Incluye dashboard juridico, CRM, expedientes, agenda y automatizacion documental basica.',
        monthlyPrice: 19,
      },
      {
        code: 'professional',
        name: 'Plan Profesional',
        description: 'Ideal para despachos pequenos y medianos. Incluye todo el plan basico, portal del cliente, prestaciones laborales y automatizaciones n8n.',
        monthlyPrice: 49,
      },
      {
        code: 'business',
        name: 'Plan Corporativo',
        description: 'Ideal para bufetes grandes y departamentos legales. Incluye IA avanzada, API empresarial, multiempresa, multi-sucursal y soporte VIP.',
        monthlyPrice: 99,
      },
      {
        code: 'enterprise',
        name: 'Plan Enterprise',
        description: 'Desde USD 299/mes para firmas nacionales e instituciones. Incluye infraestructura dedicada, marca blanca y SLA empresarial.',
        monthlyPrice: 299,
      },
    ];

    for (const item of defaults) {
      const existing = await this.planRepository.findOne({ where: { code: item.code } });
      if (existing) {
        existing.name = item.name;
        existing.description = item.description;
        existing.monthlyPrice = item.monthlyPrice;
        existing.currency = 'USD';
        existing.isActive = true;
        existing.enablesPremiumFeatures = true;
        await this.planRepository.save(existing);
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

  private getPlanLimits(code: string): PlanLimits {
    const limitsByCode: Record<string, PlanLimits> = {
      basic: {
        label: 'Límites del plan',
        items: ['1 usuario', '100 consultas IA/mes', '20 documentos IA/mes', '2 GB de almacenamiento'],
      },
      professional: {
        label: 'Límites del plan',
        items: ['Usuarios para despacho', 'Consultas IA ilimitadas*', '5 automatizaciones n8n', '50 GB de almacenamiento'],
      },
      business: {
        label: 'Límites del plan',
        items: ['Usuarios ilimitados', 'Automatizaciones ilimitadas', '500 GB de almacenamiento', 'API empresarial'],
      },
      enterprise: {
        label: 'Límites del plan',
        items: ['Implementación a medida', 'Infraestructura dedicada', 'Marca blanca', 'SLA empresarial'],
      },
    };

    return limitsByCode[code] ?? { label: 'Límites del plan', items: [] };
  }

  private serializePlan(plan: SubscriptionPlan) {
    return {
      ...plan,
      limits: this.getPlanLimits(plan.code),
    };
  }

  private getPayPalMode() {
    return process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox';
  }

  private getPayPalBaseUrl() {
    return this.getPayPalMode() === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  }

  private getAppUrl() {
    return (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  }

  private getApiUrl() {
    return (process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '');
  }

  private hasRealPayPalConfig() {
    return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET);
  }

  private getHeaderValue(headers: PayPalWebhookHeaders, key: string) {
    const value = headers[key] ?? headers[key.toLowerCase()];
    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    return typeof value === 'string' && value.trim() ? value : null;
  }

  private async getPayPalAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;

    if (!clientId || !secret) {
      throw new BadRequestException('PayPal no está configurado');
    }

    const response = await fetch(`${this.getPayPalBaseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new BadRequestException('No se pudo autenticar con PayPal');
    }

    const data = (await response.json()) as { access_token?: string };
    if (!data.access_token) {
      throw new BadRequestException('No se pudo obtener el token de acceso de PayPal');
    }

    return data.access_token;
  }

  private async createPayPalOrder(plan: SubscriptionPlan, userId: string) {
    const accessToken = await this.getPayPalAccessToken();
    const response = await fetch(`${this.getPayPalBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: plan.code,
            custom_id: userId,
            description: plan.name,
            amount: {
              currency_code: plan.currency,
              value: plan.monthlyPrice.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: process.env.LEGAL_OFFICE_NAME ?? 'ITZALAN TECH',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${this.getAppUrl()}/suscripciones?paypal=approved&source=paypal`,
          cancel_url: `${this.getAppUrl()}/suscripciones?paypal=cancelled&source=paypal`,
          shipping_preference: 'NO_SHIPPING',
          locale: 'es-ES',
        },
      }),
    });

    if (!response.ok) {
      throw new BadRequestException('No se pudo iniciar el checkout de PayPal');
    }

    const data = (await response.json()) as { id?: string; links?: Array<{ rel?: string; href?: string }> };
    return {
      externalReferenceId: data.id ?? `${userId}-${Date.now()}`,
      approvalUrl: data.links?.find((item) => item.rel === 'approve')?.href ?? null,
      checkoutMode: this.getPayPalMode(),
    };
  }

  findPlans(includeInactive = false) {
    return this.planRepository.find({
      where: includeInactive ? {} : { isActive: true },
      order: { monthlyPrice: 'ASC' },
    }).then((plans) => plans.map((plan) => this.serializePlan(plan)));
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
    // Prefer an active subscription; fall back to the most recent one for display purposes
    const subscription =
      (await this.userSubscriptionRepository.findOne({
        where: { userId, status: 'active' },
        relations: { plan: true },
        order: { createdAt: 'DESC' },
      })) ??
      (await this.userSubscriptionRepository.findOne({
        where: { userId },
        relations: { plan: true },
        order: { createdAt: 'DESC' },
      }));

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
      subscription: {
        ...subscription,
        plan: this.serializePlan(subscription.plan),
      },
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

    if (provider === 'paypal' && this.hasRealPayPalConfig()) {
      const paypalOrder = await this.createPayPalOrder(plan, userId);

      const payment = this.paymentRepository.create({
        userId,
        planId: plan.id,
        provider,
        status: 'pending',
        amount: plan.monthlyPrice,
        currency: plan.currency,
        externalPaymentId: paypalOrder.externalReferenceId,
      });
      await this.paymentRepository.save(payment);

      const subscription = this.userSubscriptionRepository.create({
        userId,
        planId: plan.id,
        provider,
        status: 'past_due',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        externalSubscriptionId: paypalOrder.externalReferenceId,
      });
      const savedSubscription = await this.userSubscriptionRepository.save(subscription);

      return {
        message: 'Checkout PayPal iniciado',
        provider,
        checkoutMode: paypalOrder.checkoutMode,
        approvalUrl: paypalOrder.approvalUrl,
        payment,
        subscription: savedSubscription,
        plan: this.serializePlan(plan),
      };
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
      checkoutMode: provider === 'paypal' ? this.getPayPalMode() : (process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'),
      payment: transaction,
      subscription: savedSubscription,
      plan: this.serializePlan(plan),
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

  async handleStripeWebhook(payload: unknown, signature?: string, webhookSecret?: string) {
    this.assertWebhookSecret('stripe', webhookSecret);

    const event = payload as Record<string, unknown>;
    const eventType = typeof event.type === 'string' ? event.type : 'unknown';
    const dataObject = this.getNestedObject(event, ['data', 'object']);

    switch (eventType) {
      case 'invoice.payment_succeeded': {
        const externalSubscriptionId = this.getStringValue(dataObject, ['subscription']);
        const externalPaymentId = this.getStringValue(dataObject, ['payment_intent']);
        if (externalSubscriptionId) {
          await this.updateSubscriptionByExternalId(externalSubscriptionId, 'active');
        }
        if (externalPaymentId) {
          await this.updatePaymentByExternalId(externalPaymentId, 'completed');
        }
        break;
      }
      case 'invoice.payment_failed': {
        const externalSubscriptionId = this.getStringValue(dataObject, ['subscription']);
        if (externalSubscriptionId) {
          await this.updateSubscriptionByExternalId(externalSubscriptionId, 'past_due');
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const externalSubscriptionId = this.getStringValue(dataObject, ['id']);
        if (externalSubscriptionId) {
          await this.updateSubscriptionByExternalId(externalSubscriptionId, 'cancelled');
        }
        break;
      }
      case 'customer.subscription.updated': {
        const externalSubscriptionId = this.getStringValue(dataObject, ['id']);
        const statusRaw = this.getStringValue(dataObject, ['status']);
        if (externalSubscriptionId && statusRaw) {
          const mappedStatus = this.mapStripeStatus(statusRaw);
          await this.updateSubscriptionByExternalId(externalSubscriptionId, mappedStatus);
        }
        break;
      }
      default:
        break;
    }

    return {
      received: true,
      provider: 'stripe',
      eventType,
      verified: Boolean(signature),
      mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
    };
  }

  private assertWebhookSecret(provider: 'stripe' | 'paypal', incomingSecret?: string) {
    const configuredSecret = provider === 'stripe' ? process.env.STRIPE_WEBHOOK_SECRET : process.env.PAYPAL_WEBHOOK_SECRET;
    if (!configuredSecret) {
      return;
    }

    if (!incomingSecret || incomingSecret !== configuredSecret) {
      throw new UnauthorizedException(`Webhook ${provider} no autorizado`);
    }
  }

  async handlePaypalWebhook(payload: unknown, headers: PayPalWebhookHeaders = {}) {
    const verified = await this.verifyPaypalWebhook(payload, headers);
    const event = payload as Record<string, unknown>;
    const eventType = typeof event.event_type === 'string' ? event.event_type : 'unknown';
    const resource = this.getNestedObject(event, ['resource']);
    const externalReferenceId =
      this.getStringValue(resource, ['id']) ??
      this.getStringValue(resource, ['billing_agreement_id']) ??
      this.getStringValue(resource, ['subscription_id']) ??
      this.getStringValue(resource, ['supplementary_data', 'related_ids', 'order_id']);

    const mappedStatus = this.mapPaypalStatus(eventType);

    if (externalReferenceId && mappedStatus) {
      await this.updateSubscriptionByExternalId(externalReferenceId, mappedStatus);
      if (mappedStatus === 'active') {
        await this.updatePaymentByExternalId(externalReferenceId, 'completed');
      }
      if (mappedStatus === 'past_due') {
        await this.updatePaymentByExternalId(externalReferenceId, 'failed');
      }
    }

    return {
      received: true,
      provider: 'paypal',
      eventType,
      verified,
      mode: this.getPayPalMode(),
      status: mappedStatus ?? 'ignored',
    };
  }

  private async verifyPaypalWebhook(payload: unknown, headers: PayPalWebhookHeaders) {
    const configuredSecret = process.env.PAYPAL_WEBHOOK_SECRET;
    const incomingSecret = this.getHeaderValue(headers, 'x-webhook-secret');
    if (!configuredSecret) {
      return Boolean(incomingSecret);
    }

    if (incomingSecret && incomingSecret === configuredSecret) {
      return true;
    }

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      return false;
    }

    const accessToken = await this.getPayPalAccessToken();
    const response = await fetch(`${this.getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: this.getHeaderValue(headers, 'paypal-auth-algo') ?? '',
        cert_url: this.getHeaderValue(headers, 'paypal-cert-url') ?? '',
        transmission_id: this.getHeaderValue(headers, 'paypal-transmission-id') ?? '',
        transmission_sig: this.getHeaderValue(headers, 'paypal-transmission-sig') ?? '',
        transmission_time: this.getHeaderValue(headers, 'paypal-transmission-time') ?? '',
        webhook_id: webhookId,
        webhook_event: payload,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as { verification_status?: string };
    return data.verification_status === 'SUCCESS';
  }

  private async updateSubscriptionByExternalId(externalSubscriptionId: string, status: SubscriptionStatus) {
    const subscription = await this.userSubscriptionRepository.findOne({ where: { externalSubscriptionId } });
    if (!subscription) {
      return;
    }

    subscription.status = status;
    if (status === 'cancelled' || status === 'expired') {
      subscription.endsAt = new Date();
    }

    await this.userSubscriptionRepository.save(subscription);
  }

  private async updatePaymentByExternalId(externalPaymentId: string, status: 'pending' | 'completed' | 'failed') {
    const payment = await this.paymentRepository.findOne({ where: { externalPaymentId } });
    if (!payment) {
      return;
    }

    payment.status = status;
    await this.paymentRepository.save(payment);
  }

  private getNestedObject(source: Record<string, unknown>, path: string[]) {
    let current: unknown = source;
    for (const key of path) {
      if (!current || typeof current !== 'object' || !(key in current)) {
        return {} as Record<string, unknown>;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current && typeof current === 'object' ? (current as Record<string, unknown>) : ({} as Record<string, unknown>);
  }

  private getStringValue(source: Record<string, unknown>, path: string[]) {
    let current: unknown = source;
    for (const key of path) {
      if (!current || typeof current !== 'object' || !(key in current)) {
        return null;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return typeof current === 'string' && current.trim() ? current : null;
  }

  private mapStripeStatus(status: string): SubscriptionStatus {
    switch (status) {
      case 'active':
        return 'active';
      case 'past_due':
      case 'unpaid':
        return 'past_due';
      case 'canceled':
        return 'cancelled';
      case 'incomplete_expired':
        return 'expired';
      default:
        return 'active';
    }
  }

  private mapPaypalStatus(eventType: string): SubscriptionStatus | null {
    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED':
      case 'BILLING.SUBSCRIPTION.APPROVED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'PAYMENT.CAPTURE.COMPLETED':
      case 'PAYMENT.SALE.COMPLETED':
        return 'active';
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.SALE.DENIED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        return 'past_due';
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        return 'cancelled';
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        return 'expired';
      default:
        return null;
    }
  }
}
