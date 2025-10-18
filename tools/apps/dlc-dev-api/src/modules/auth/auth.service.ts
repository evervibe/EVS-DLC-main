import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createLogger } from '../../common/utils';
import { ApiError } from '../../common/errors';
import { LoginDto, LoginResponseDto } from './auth.dto';

@Injectable()
export class AuthService {
  private logger = createLogger('AuthService');

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log('User login attempt', { username: dto.username });

    try {
      const adminUsername = this.configService.get<string>('ADMIN_USERNAME', 'admin');
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD', 'admin');

      if (dto.username !== adminUsername || dto.password !== adminPassword) {
        throw ApiError.unauthorized('Invalid credentials', 'AUTH_INVALID_CREDENTIALS');
      }

      const payload = {
        sub: adminUsername,
        username: adminUsername,
        roles: ['admin'],
      };

      const token = this.jwtService.sign(payload);
      const expiresIn = this.configService.get<number>('JWT_EXPIRES_IN', 3600);
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      this.logger.log('User authenticated', { username: dto.username });

      return {
        token,
        expiresAt,
        user: {
          id: adminUsername,
          username: adminUsername,
          roles: ['admin'],
        },
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      this.logger.error('Login error', error instanceof Error ? error.stack : undefined);
      throw ApiError.internal('Login failed');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(token);
      return true;
    } catch {
      return false;
    }
  }
}
