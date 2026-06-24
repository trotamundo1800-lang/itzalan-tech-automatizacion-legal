import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackEntity } from './feedback.entity';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectRepository(FeedbackEntity)
    private readonly feedbackRepo: Repository<FeedbackEntity>,
  ) {}

  async submit(dto: CreateFeedbackDto, ipAddress?: string): Promise<{ message: string }> {
    // 1. Persist to database
    const record = this.feedbackRepo.create({
      nombre: dto.nombre,
      profesion: dto.profesion,
      areaPractica: dto.areaPractica,
      ciudad: dto.ciudad,
      experienciaGeneral: dto.experienciaGeneral,
      moduloMasUtil: dto.moduloMasUtil,
      problemasRegistro: dto.problemasRegistro,
      utilidadClientesExpedientes: dto.utilidadClientesExpedientes,
      documentosFrecuentes: dto.documentosFrecuentes,
      formatosAgregar: dto.formatosAgregar,
      ayudaIA: dto.ayudaIA,
      claridadIA: dto.claridadIA,
      consultasIA: dto.consultasIA,
      pagaria: dto.pagaria,
      planInteres: dto.planInteres,
      precioRazonable: dto.precioRazonable,
      funcionPago: dto.funcionPago,
      recomendaria: dto.recomendaria,
      calificacion: dto.calificacion,
      mejoras: dto.mejoras,
      comentarios: dto.comentarios,
      ipAddress,
    });

    await this.feedbackRepo.save(record);
    this.logger.log(`Feedback saved: id=${record.id} nombre=${dto.nombre}`);

    // 2. Optional: forward to Google Sheets webhook
    const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...record }),
        });
        if (!response.ok) {
          this.logger.warn(`Webhook responded with status ${response.status} — data already saved to DB`);
        }
      } catch (err) {
        this.logger.warn(`Webhook failed — data already saved to DB: ${String(err)}`);
      }
    }

    return { message: 'Retroalimentación recibida correctamente.' };
  }
}
