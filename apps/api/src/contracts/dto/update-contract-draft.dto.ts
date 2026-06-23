import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateContractDraftDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  tipoContrato?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  nombreCliente?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  descripcionCaso?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  resumen?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  clausulasSugeridas?: string[];
}