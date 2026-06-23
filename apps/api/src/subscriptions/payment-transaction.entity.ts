import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../auth/user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionProvider } from './user-subscription.entity';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

@Entity({ name: 'payment_transactions' })
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => SubscriptionPlan, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'planId' })
  plan?: SubscriptionPlan | null;

  @Column({ type: 'uuid', nullable: true })
  planId!: string | null;

  @Column({ type: 'varchar', length: 20 })
  provider!: SubscriptionProvider;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: PaymentStatus;

  @Column({ type: 'float' })
  amount!: number;

  @Column({ length: 8, default: 'USD' })
  currency!: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  externalPaymentId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
