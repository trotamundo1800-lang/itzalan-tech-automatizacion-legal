import { IsIn, IsObject, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  nombreArchivo?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  tipoDocumento?: string;

  @IsOptional()
  @IsIn(['docx', 'pdf'])
  formato?: 'docx' | 'pdf';

  @IsOptional()
  @IsString()
  @MinLength(1)
  plantilla?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;

  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsOptional()
  @IsUUID()
  expedienteId?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  observaciones?: string;
}
