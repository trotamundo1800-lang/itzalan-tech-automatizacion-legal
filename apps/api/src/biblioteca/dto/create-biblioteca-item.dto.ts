import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateBibliotecaItemDto {
  @IsString()
  @MinLength(3)
  titulo!: string;

  @IsIn(['ley', 'reglamento', 'jurisprudencia', 'doctrina', 'formulario'])
  tipo!: 'ley' | 'reglamento' | 'jurisprudencia' | 'doctrina' | 'formulario';

  @IsString()
  @MinLength(10)
  descripcion!: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  fuente?: string;

  @IsOptional()
  @IsUrl({}, { message: 'La URL no es válida' })
  url?: string;

  @IsOptional()
  @IsIn(['activo', 'archivado'])
  estado?: 'activo' | 'archivado';
}
