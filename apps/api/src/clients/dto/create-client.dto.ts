import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(7)
  telefono!: string;

  @IsString()
  @MinLength(5)
  direccion!: string;

  @IsOptional()
  @IsIn(['activo', 'inactivo'])
  estado?: 'activo' | 'inactivo';
}
