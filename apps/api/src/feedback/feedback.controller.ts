import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Query,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller('api/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  findRecent(@Query('limit') limit?: string) {
    return this.feedbackService.findRecent(limit ? Number(limit) : 20);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async submit(
    @Body() dto: CreateFeedbackDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      undefined;
    try {
      return await this.feedbackService.submit(dto, ip);
    } catch {
      throw new InternalServerErrorException('No se pudo guardar el feedback. Intente nuevamente.');
    }
  }
}
