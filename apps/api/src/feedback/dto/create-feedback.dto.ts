import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsString()
  profesion!: string;

  @IsOptional()
  @IsString()
  areaPractica?: string;

  @IsNotEmpty()
  @IsString()
  ciudad!: string;

  @IsOptional()
  @IsString()
  experienciaGeneral?: string;

  @IsOptional()
  @IsString()
  moduloMasUtil?: string;

  @IsOptional()
  @IsString()
  problemasRegistro?: string;

  @IsOptional()
  @IsString()
  utilidadClientesExpedientes?: string;

  @IsOptional()
  @IsString()
  documentosFrecuentes?: string;

  @IsOptional()
  @IsString()
  formatosAgregar?: string;

  @IsOptional()
  @IsString()
  ayudaIA?: string;

  @IsOptional()
  @IsString()
  claridadIA?: string;

  @IsOptional()
  @IsString()
  consultasIA?: string;

  @IsOptional()
  @IsString()
  pagaria?: string;

  @IsOptional()
  @IsString()
  planInteres?: string;

  @IsOptional()
  @IsString()
  precioRazonable?: string;

  @IsOptional()
  @IsString()
  funcionPago?: string;

  @IsOptional()
  @IsString()
  recomendaria?: string;

  @IsNotEmpty()
  @IsString()
  calificacion!: string;

  @IsOptional()
  @IsString()
  mejoras?: string;

  @IsOptional()
  @IsString()
  comentarios?: string;
}
