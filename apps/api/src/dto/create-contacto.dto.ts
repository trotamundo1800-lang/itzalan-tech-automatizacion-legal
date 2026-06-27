import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateContactoDto {
  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsString()
  @MinLength(7)
  telefono!: string;

  @IsEmail()
  correo!: string;

  @IsString()
  @MinLength(10)
  mensaje!: string;
}
