import { IsOptional, IsUUID } from 'class-validator';

export class AssociateConversationDto {
  @IsOptional()
  @IsUUID()
  expedienteId?: string;

  @IsOptional()
  @IsUUID()
  clienteId?: string;
}