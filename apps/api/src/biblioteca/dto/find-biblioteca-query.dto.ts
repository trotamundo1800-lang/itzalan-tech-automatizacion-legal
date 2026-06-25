import { IsIn, IsOptional, IsString } from 'class-validator';

export class FindBibliotecaQueryDto {
  @IsOptional()
  @IsIn(['ley', 'reglamento', 'jurisprudencia', 'doctrina', 'formulario'])
  tipo?: 'ley' | 'reglamento' | 'jurisprudencia' | 'doctrina' | 'formulario';

  @IsOptional()
  @IsIn(['activo', 'archivado'])
  estado?: 'activo' | 'archivado';

  @IsOptional()
  @IsString()
  q?: string;
}
