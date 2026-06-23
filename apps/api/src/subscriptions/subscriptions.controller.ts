import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CheckoutSubscriptionDto } from './dto/checkout-subscription.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdateSubscriptionStatusDto } from './dto/update-subscription-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  listPlans() {
    return this.subscriptionsService.findPlans();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'abogado', 'asistente', 'cliente')
  @Get('me')
  mySubscription(
    @Request()
    req: {
      user: {
        userId: string;
      };
    },
  ) {
    return this.subscriptionsService.getUserSubscription(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'abogado', 'asistente', 'cliente')
  @Post('checkout/stripe')
  checkoutStripe(
    @Request() req: { user: { userId: string } },
    @Body() payload: CheckoutSubscriptionDto,
  ) {
    return this.subscriptionsService.checkoutWithStripe(req.user.userId, payload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'abogado', 'asistente', 'cliente')
  @Post('checkout/paypal')
  checkoutPaypal(
    @Request() req: { user: { userId: string } },
    @Body() payload: CheckoutSubscriptionDto,
  ) {
    return this.subscriptionsService.checkoutWithPaypal(req.user.userId, payload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'abogado', 'asistente', 'cliente')
  @Post('cancel')
  cancelCurrentSubscription(@Request() req: { user: { userId: string } }) {
    return this.subscriptionsService.cancelCurrentSubscription(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/plans')
  listPlansForAdmin() {
    return this.subscriptionsService.findPlans(true);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/plans')
  createPlan(@Body() payload: CreatePlanDto) {
    return this.subscriptionsService.createPlan(payload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/plans/:id')
  updatePlan(@Param('id') id: string, @Body() payload: UpdatePlanDto) {
    return this.subscriptionsService.updatePlan(id, payload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/user-subscriptions')
  listUserSubscriptions() {
    return this.subscriptionsService.listUserSubscriptions();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/user-subscriptions/:id/status')
  updateSubscriptionStatus(@Param('id') id: string, @Body() payload: UpdateSubscriptionStatusDto) {
    return this.subscriptionsService.updateSubscriptionStatus(id, payload.status);
  }
}
