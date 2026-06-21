import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: registerDto.email } });
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: (registerDto.role || 'cliente') as UserRole,
    });
    await this.userRepository.save(user);

    return this.generateToken(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateToken(user);
  }

  async logout(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    await this.userRepository.update(userId, {
      refreshToken: null,
      tokenVersion: user.tokenVersion + 1,
    });
  }

  async logoutByRefreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_TO_A_STRONG_VALUE',
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('No autorizado');
      }

      if (payload.tokenVersion !== user.tokenVersion) {
        await this.revokeAllSessions(user.id, user.tokenVersion);
        throw new UnauthorizedException('No autorizado');
      }

      const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!refreshTokenMatches) {
        await this.revokeAllSessions(user.id, user.tokenVersion);
        throw new UnauthorizedException('No autorizado');
      }

      await this.revokeAllSessions(user.id, user.tokenVersion);
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_TO_A_STRONG_VALUE',
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('No autorizado');
      }

      if (payload.tokenVersion !== user.tokenVersion) {
        await this.revokeAllSessions(user.id, user.tokenVersion);
        throw new UnauthorizedException('No autorizado');
      }

      const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!refreshTokenMatches) {
        await this.revokeAllSessions(user.id, user.tokenVersion);
        throw new UnauthorizedException('No autorizado');
      }

      const tokens = await this.getTokens(user);
      await this.updateRefreshToken(user.id, tokens.refreshToken);
      return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  private async generateToken(user: User) {
    const tokens = await this.getTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  private async getTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      tokenVersion: user.tokenVersion,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_TO_A_STRONG_VALUE',
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, { refreshToken: hashedRefreshToken });
  }

  private async revokeAllSessions(userId: string, currentTokenVersion: number) {
    await this.userRepository.update(userId, {
      refreshToken: null,
      tokenVersion: currentTokenVersion + 1,
    });
  }
}
