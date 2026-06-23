import { IsString, MinLength } from 'class-validator';

export class GenerateDraftDto {
  @IsString()
  @MinLength(3)
  tipoBorrador!: string;

  @IsString()
  @MinLength(10)
  hechos!: string;

  @IsString()
  @MinLength(10)
  objetivo!: string;
}
