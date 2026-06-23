import { IsIn } from 'class-validator';

export class UpdateSubscriptionStatusDto {
  @IsIn(['active', 'past_due', 'cancelled', 'expired'])
  status!: 'active' | 'past_due' | 'cancelled' | 'expired';
}
