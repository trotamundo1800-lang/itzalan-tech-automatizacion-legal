import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../auth/user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export type SubscriptionProvider = 'stripe' | 'paypal';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'expired';

@Entity({ name: 'user_subscriptions' })
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => SubscriptionPlan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'planId' })
  plan!: SubscriptionPlan;

  @Column({ type: 'uuid' })
  planId!: string;

  @Column({ type: 'varchar', length: 20 })
  provider!: SubscriptionProvider;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: SubscriptionStatus;

  @Column({ type: 'datetime' })
  startsAt!: Date;

  @Column({ type: 'datetime' })
  endsAt!: Date;

  @Column({ type: 'boolean', default: true })
  autoRenew!: boolean;

  @Column({ type: 'varchar', nullable: true, length: 120 })
  externalSubscriptionId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
