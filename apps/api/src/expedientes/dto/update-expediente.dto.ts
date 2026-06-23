import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateExpedienteDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  tipo?: string;

  @IsOptional()
  @IsIn(['abierto', 'en_proceso', 'cerrado'])
  estado?: 'abierto' | 'en_proceso' | 'cerrado';

  @IsOptional()
  @IsDateString()
  fechaApertura?: string;

  @IsOptional()
  @IsUUID()
  clienteId?: string;
}
