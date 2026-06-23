import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class AnalyzeDocumentDto {
  @IsOptional()
  @IsUUID()
  documentoId?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  contenido?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  pregunta?: string;
}
