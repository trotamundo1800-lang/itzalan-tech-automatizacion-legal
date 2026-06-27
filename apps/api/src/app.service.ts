import { Injectable, Logger } from '@nestjs/common';
import { CreateContactoDto } from './dto/create-contacto.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getStatus() {
    return { status: 'ok', message: 'API de ITZALAN TECH está activa' };
  }

  getHealth() {
    return {
      status: 'ok',
      message: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  submitContacto(payload: CreateContactoDto) {
    this.logger.log(`Solicitud de contacto recibida de ${payload.nombre} <${payload.correo}>`);
    return {
      message: 'Solicitud recibida correctamente. Te contactaremos en menos de 24 horas hábiles.',
    };
  }
}
