import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class ConsultarBibliotecaDto {
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  pregunta!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  contexto?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  tipoDocumento?: string;
}

