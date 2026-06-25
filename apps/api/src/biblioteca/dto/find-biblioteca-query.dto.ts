import { IsIn, IsOptional, IsString } from 'class-validator';

export class FindBibliotecaQueryDto {
  @IsOptional()
  @IsIn(['ley', 'reglamento', 'jurisprudencia', 'doctrina', 'formulario', 'otro'])
  tipoDocumento?: 'ley' | 'reglamento' | 'jurisprudencia' | 'doctrina' | 'formulario' | 'otro';

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  q?: string;
}
