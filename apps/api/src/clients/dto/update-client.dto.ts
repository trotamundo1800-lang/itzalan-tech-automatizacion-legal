import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  direccion?: string;

  @IsOptional()
  @IsIn(['activo', 'inactivo'])
  estado?: 'activo' | 'inactivo';
}
