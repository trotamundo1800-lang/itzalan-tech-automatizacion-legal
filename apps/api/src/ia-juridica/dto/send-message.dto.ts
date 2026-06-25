import { IsOptional, IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(10)
  pregunta!: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  contextoJuridico?: string;
}