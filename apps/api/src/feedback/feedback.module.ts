import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackEntity } from './feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeedbackEntity])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
