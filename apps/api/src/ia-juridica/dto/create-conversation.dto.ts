import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  contextoJuridico?: string;

  @IsOptional()
  @IsUUID()
  expedienteId?: string;

  @IsOptional()
  @IsUUID()
  clienteId?: string;
}