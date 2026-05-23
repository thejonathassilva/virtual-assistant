import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/usuario.entity';

describe('AuthService', () => {
  const usersService = {
    findByEmail: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn().mockReturnValue('token'),
    verify: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  it('rejeita login com senha invalida', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'admin@restaurante.com',
      ativo: true,
      senha_hash: await bcrypt.hash('Restaurante@123', 4),
      role: UserRole.ADMIN,
      nome: 'Admin',
    });

    await expect(
      service.login({ email: 'admin@restaurante.com', senha: 'errada' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('retorna token quando credenciais sao validas', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'admin@restaurante.com',
      ativo: true,
      senha_hash: await bcrypt.hash('Restaurante@123', 4),
      role: UserRole.ADMIN,
      nome: 'Admin',
    });

    const result = await service.login({
      email: 'admin@restaurante.com',
      senha: 'Restaurante@123',
    });

    expect(result.access_token).toBe('token');
    expect(jwtService.sign).toHaveBeenCalled();
  });
});
