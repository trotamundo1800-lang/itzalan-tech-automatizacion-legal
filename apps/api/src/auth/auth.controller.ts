import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logoutByRefreshToken(refreshTokenDto.refreshToken);
    return { message: 'Sesión cerrada' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'abogado', 'asistente', 'cliente')
  @Get('profile')
  getProfile(
    @Request()
    req: {
      user: {
        userId: number | string;
        email: string;
        role: string;
        name: string;
      };
    },
  ) {
    return req.user;
  }
}
