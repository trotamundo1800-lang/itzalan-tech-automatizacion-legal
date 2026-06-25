import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UploadBibliotecaDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  titulo!: string;

  @IsIn(['ley', 'reglamento', 'jurisprudencia', 'doctrina', 'formulario', 'otro'])
  tipoDocumento!: 'ley' | 'reglamento' | 'jurisprudencia' | 'doctrina' | 'formulario' | 'otro';

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  categoria!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descripcion?: string;
}
