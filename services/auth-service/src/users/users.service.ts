import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario, UserRole } from './entities/usuario.entity';

/** Alinhado ao seed do admin-service (Duas Mãos, Uma Mesa). */
export const DEFAULT_RESTAURANTE_ID = '11111111-1111-4111-8111-111111111111';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') return;
    await this.seedDevUsers();
  }

  private async seedDevUsers() {
    const senha = await bcrypt.hash('Restaurante@123', 10);

    const platform = await this.repo.findOne({
      where: { email: 'platform@facilita.com' },
    });
    if (!platform) {
      await this.repo.save(
        this.repo.create({
          nome: 'Facilita Virtual',
          email: 'platform@facilita.com',
          role: UserRole.PLATFORM_OWNER,
          senha_hash: senha,
          ativo: true,
          restaurante_id: null,
        }),
      );
    }

    const restaurantUsers = [
      { nome: 'Admin', email: 'admin@restaurante.com', role: UserRole.ADMIN },
      { nome: 'Cozinha', email: 'cozinha@restaurante.com', role: UserRole.COZINHA },
      { nome: 'Garçom', email: 'garcom@restaurante.com', role: UserRole.GARCOM },
      { nome: 'Caixa', email: 'caixa@restaurante.com', role: UserRole.CAIXA },
    ];

    for (const u of restaurantUsers) {
      const existing = await this.repo.findOne({ where: { email: u.email } });
      if (existing) {
        if (!existing.restaurante_id) {
          existing.restaurante_id = DEFAULT_RESTAURANTE_ID;
          await this.repo.save(existing);
        }
        continue;
      }
      await this.repo.save(
        this.repo.create({
          ...u,
          senha_hash: senha,
          ativo: true,
          restaurante_id: DEFAULT_RESTAURANTE_ID,
        }),
      );
    }
  }

  findAll(restauranteId?: string | null) {
    const where =
      restauranteId === undefined
        ? {}
        : restauranteId === null
          ? { restaurante_id: null as unknown as string }
          : { restaurante_id: restauranteId };
    return this.repo.find({
      where,
      select: [
        'id',
        'nome',
        'email',
        'role',
        'ativo',
        'restaurante_id',
        'created_at',
        'updated_at',
      ],
      order: { nome: 'ASC' },
    });
  }

  findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
      select: [
        'id',
        'nome',
        'email',
        'role',
        'ativo',
        'senha_hash',
        'cognito_sub',
        'restaurante_id',
      ],
    });
  }

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findAdminByRestaurante(restauranteId: string) {
    const rows = await this.repo.find({
      where: { restaurante_id: restauranteId, role: UserRole.ADMIN, ativo: true },
      select: [
        'id',
        'nome',
        'email',
        'role',
        'ativo',
        'restaurante_id',
        'created_at',
        'updated_at',
      ],
      order: { created_at: 'ASC' },
      take: 1,
    });
    return rows[0] ?? null;
  }

  async create(dto: CreateUsuarioDto) {
    const senha_hash = dto.senha
      ? await bcrypt.hash(dto.senha, 10)
      : undefined;
    const user = this.repo.create({
      ...dto,
      senha_hash,
      restaurante_id:
        dto.role === UserRole.PLATFORM_OWNER
          ? null
          : dto.restaurante_id ?? DEFAULT_RESTAURANTE_ID,
    });
    return this.repo.save(user);
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const user = await this.findById(id);
    if (dto.senha) {
      (dto as UpdateUsuarioDto & { senha_hash?: string }).senha_hash =
        await bcrypt.hash(dto.senha, 10);
      delete dto.senha;
    }
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async updateAuthorized(
    id: string,
    dto: UpdateUsuarioDto,
    ctx: { role?: string; restauranteId?: string },
  ) {
    const user = await this.findById(id);
    if (ctx.role === UserRole.PLATFORM_OWNER) {
      if (user.role === UserRole.PLATFORM_OWNER) {
        throw new ForbiddenException('Não é permitido alterar platform_owner');
      }
      if (dto.role === UserRole.PLATFORM_OWNER) {
        throw new ForbiddenException('Perfil não permitido');
      }
    } else {
      if (!ctx.restauranteId || user.restaurante_id !== ctx.restauranteId) {
        throw new ForbiddenException('Usuário fora do tenant');
      }
      if (dto.role === UserRole.PLATFORM_OWNER) {
        throw new ForbiddenException('Perfil não permitido');
      }
    }
    const saved = await this.update(id, dto);
    const { senha_hash: _, cognito_sub: __, ...safe } = saved;
    return safe;
  }

  async deactivate(id: string) {
    const user = await this.findById(id);
    user.ativo = false;
    return this.repo.save(user);
  }
}
