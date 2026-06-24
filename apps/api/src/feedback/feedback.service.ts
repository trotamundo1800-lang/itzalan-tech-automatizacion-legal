import { Injectable, Logger } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  async submit(dto: CreateFeedbackDto): Promise<{ message: string }> {
    const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;

    if (!webhookUrl) {
      this.logger.warn('FEEDBACK_WEBHOOK_URL not set — feedback logged locally only');
      this.logger.log(JSON.stringify({ ...dto, receivedAt: new Date().toISOString() }));
      return { message: 'Retroalimentación recibida.' };
    }

    const payload = {
      nombre: dto.nombre,
      profesion: dto.profesion,
      areaPractica: dto.areaPractica ?? '',
      ciudad: dto.ciudad,
      experienciaGeneral: dto.experienciaGeneral ?? '',
      moduloMasUtil: dto.moduloMasUtil ?? '',
      problemasRegistro: dto.problemasRegistro ?? '',
      utilidadClientesExpedientes: dto.utilidadClientesExpedientes ?? '',
      documentosFrecuentes: dto.documentosFrecuentes ?? '',
      formatosAgregar: dto.formatosAgregar ?? '',
      ayudaIA: dto.ayudaIA ?? '',
      claridadIA: dto.claridadIA ?? '',
      consultasIA: dto.consultasIA ?? '',
      pagaria: dto.pagaria ?? '',
      planInteres: dto.planInteres ?? '',
      precioRazonable: dto.precioRazonable ?? '',
      funcionPago: dto.funcionPago ?? '',
      recomendaria: dto.recomendaria ?? '',
      calificacion: dto.calificacion,
      mejoras: dto.mejoras ?? '',
      comentarios: dto.comentarios ?? '',
      receivedAt: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      this.logger.error(`Webhook responded with status ${response.status}`);
      throw new Error('Error al reenviar feedback al webhook.');
    }

    return { message: 'Retroalimentación recibida y enviada correctamente.' };
  }
}
