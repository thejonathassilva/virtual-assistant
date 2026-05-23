import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario, UserRole } from './entities/usuario.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') return;
    const count = await this.repo.count();
    if (count === 0) {
      await this.seedDevUsers();
    }
  }

  private async seedDevUsers() {
    const senha = await bcrypt.hash('Restaurante@123', 10);
    const users = [
      { nome: 'Admin', email: 'admin@restaurante.com', role: UserRole.ADMIN },
      { nome: 'Cozinha', email: 'cozinha@restaurante.com', role: UserRole.COZINHA },
      { nome: 'Garçom', email: 'garcom@restaurante.com', role: UserRole.GARCOM },
      { nome: 'Caixa', email: 'caixa@restaurante.com', role: UserRole.CAIXA },
    ];
    for (const u of users) {
      await this.repo.save(
        this.repo.create({ ...u, senha_hash: senha, ativo: true }),
      );
    }
  }

  findAll() {
    return this.repo.find({
      select: ['id', 'nome', 'email', 'role', 'ativo', 'created_at', 'updated_at'],
      order: { nome: 'ASC' },
    });
  }

  findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
      select: ['id', 'nome', 'email', 'role', 'ativo', 'senha_hash', 'cognito_sub'],
    });
  }

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async create(dto: CreateUsuarioDto) {
    const senha_hash = dto.senha
      ? await bcrypt.hash(dto.senha, 10)
      : undefined;
    const user = this.repo.create({ ...dto, senha_hash });
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

  async deactivate(id: string) {
    const user = await this.findById(id);
    user.ativo = false;
    return this.repo.save(user);
  }
}
