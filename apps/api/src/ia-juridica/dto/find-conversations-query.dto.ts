import { IsOptional, IsUUID } from 'class-validator';

export class FindConversationsQueryDto {
  @IsOptional()
  @IsUUID()
  expedienteId?: string;

  @IsOptional()
  @IsUUID()
  clienteId?: string;
}