import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateAgendaEventDto {
  @IsOptional()
  @IsDateString()
  fechaHora?: string;

  @IsOptional()
  @IsIn(['audiencia', 'vencimiento', 'reunion', 'diligencia'])
  tipoEvento?: 'audiencia' | 'vencimiento' | 'reunion' | 'diligencia';

  @IsOptional()
  @IsIn(['pendiente', 'completado', 'cancelado'])
  estado?: 'pendiente' | 'completado' | 'cancelado';

  @IsOptional()
  @IsString()
  @MinLength(3)
  recordatorio?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  observaciones?: string;

  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsOptional()
  @IsUUID()
  expedienteId?: string;
}
