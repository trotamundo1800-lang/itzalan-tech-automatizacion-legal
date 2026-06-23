import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class FindExpedientesQueryDto {
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsOptional()
  @IsIn(['abierto', 'en_proceso', 'cerrado'])
  estado?: 'abierto' | 'en_proceso' | 'cerrado';
}