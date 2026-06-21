import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @MinLength(20, { message: 'Refresh token inválido' })
  refreshToken!: string;
}
