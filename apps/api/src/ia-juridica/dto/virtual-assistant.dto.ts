import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class VirtualAssistantDto {
  @IsString()
  @MinLength(10)
  consulta!: string;

  @IsOptional()
  @IsIn([
    'analisis_juridico',
    'resumen',
    'riesgos_legales',
    'estrategia_juridica',
    'redaccion_documental',
    'probabilidad_exito',
  ])
  tipoAnalisis?:
    | 'analisis_juridico'
    | 'resumen'
    | 'riesgos_legales'
    | 'estrategia_juridica'
    | 'redaccion_documental'
    | 'probabilidad_exito';

  @IsOptional()
  @IsIn(['general', 'contrato', 'expediente', 'estrategia', 'cumplimiento'])
  contexto?: 'general' | 'contrato' | 'expediente' | 'estrategia' | 'cumplimiento';

  @IsOptional()
  @IsString()
  @MinLength(5)
  detalle?: string;
}