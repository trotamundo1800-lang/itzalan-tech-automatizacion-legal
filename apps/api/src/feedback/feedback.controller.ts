import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller('api/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async submit(@Body() dto: CreateFeedbackDto): Promise<{ message: string }> {
    try {
      return await this.feedbackService.submit(dto);
    } catch {
      throw new InternalServerErrorException('No se pudo guardar el feedback. Intente nuevamente.');
    }
  }
}
