import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GenerateContractDto {
  @IsString()
  @IsNotEmpty()
  tipoContrato!: string;

  @IsString()
  @IsNotEmpty()
  nombreCliente!: string;

  @IsString()
  @MinLength(10)
  descripcionCaso!: string;
}