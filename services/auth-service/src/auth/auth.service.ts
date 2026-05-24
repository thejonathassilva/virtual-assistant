import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.ativo) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.senha_hash) {
      throw new UnauthorizedException('Usuário sem senha local (use Cognito em produção)');
    }

    const valid = await bcrypt.compare(dto.senha, user.senha_hash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      nome: user.nome,
      restaurante_id: user.restaurante_id ?? null,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        restaurante_id: user.restaurante_id ?? null,
      },
    };
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return {
        access_token: this.jwtService.sign({
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
          nome: payload.nome,
          restaurante_id: payload.restaurante_id ?? null,
        }),
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}
