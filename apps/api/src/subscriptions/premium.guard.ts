import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PREMIUM_FEATURE_KEY } from './premium-feature.decorator';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPremiumFeature = this.reflector.getAllAndOverride<boolean>(PREMIUM_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isPremiumFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { userId?: string; role?: string } }>();
    const user = request.user;

    if (!user?.userId) {
      throw new ForbiddenException('No autorizado para esta función premium');
    }

    if (user.role === 'admin') {
      return true;
    }

    const hasActiveSubscription = await this.subscriptionsService.hasActiveSubscription(user.userId);
    if (!hasActiveSubscription) {
      throw new ForbiddenException('Se requiere suscripción activa para esta función premium');
    }

    return true;
  }
}
