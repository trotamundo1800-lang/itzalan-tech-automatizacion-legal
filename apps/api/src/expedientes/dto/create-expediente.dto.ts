import { IsDateString, IsIn, IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateExpedienteDto {
  @IsString()
  @MinLength(3)
  titulo!: string;

  @IsString()
  @MinLength(10)
  descripcion!: string;

  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsIn(['abierto', 'en_proceso', 'cerrado'])
  estado!: 'abierto' | 'en_proceso' | 'cerrado';

  @IsDateString()
  fechaApertura!: string;

  @IsUUID()
  clienteId!: string;
}
