import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @MinLength(3)
  nombreArchivo!: string;

  @IsString()
  @MinLength(3)
  tipoDocumento!: string;

  @IsIn(['docx', 'pdf'])
  formato!: 'docx' | 'pdf';

  @IsString()
  @IsNotEmpty()
  plantilla!: string;

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
