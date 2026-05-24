import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as QRCode from 'qrcode';
import { Repository } from 'typeorm';
import { DEFAULT_RESTAURANTE_ID, resolveRestauranteId } from '../common/tenant';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { Mesa, MesaStatus } from './entities/mesa.entity';

@Injectable()
export class MesasService implements OnModuleInit {
  constructor(
    @InjectRepository(Mesa)
    private readonly repo: Repository<Mesa>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      await this.seedMesas();
      return;
    }
    const rows = await this.repo.find({ where: {} });
    for (const m of rows) {
      if (!m.restaurante_id) {
        m.restaurante_id = DEFAULT_RESTAURANTE_ID;
        await this.repo.save(m);
      }
    }
  }

  private mesaUrl(id: string): string {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:4201');
    return `${appUrl.replace(/\/$/, '')}/mesa/${id}`;
  }

  private async seedMesas() {
    await this.seedMesasForTenant(DEFAULT_RESTAURANTE_ID, 10);
  }

  async seedMesasForTenant(restauranteId: string, quantidade = 5) {
    const tid = resolveRestauranteId(restauranteId);
    const max = await this.repo
      .createQueryBuilder('m')
      .select('MAX(m.numero)', 'max')
      .where('m.restaurante_id = :tid', { tid })
      .getRawOne<{ max: string | null }>();
    let numero = Number(max?.max ?? 0);
    const criadas: Mesa[] = [];
    for (let i = 0; i < quantidade; i++) {
      numero += 1;
      const mesa = this.repo.create({
        numero,
        status: MesaStatus.LIVRE,
        restaurante_id: tid,
      });
      const saved = await this.repo.save(mesa);
      saved.qr_code_url = this.mesaUrl(saved.id);
      criadas.push(await this.repo.save(saved));
    }
    return criadas;
  }

  findAll(restauranteId?: string) {
    const tid = resolveRestauranteId(restauranteId);
    return this.repo.find({
      where: { restaurante_id: tid },
      order: { numero: 'ASC' },
      relations: ['sessao_ativa'],
    });
  }

  async findById(id: string) {
    const mesa = await this.repo.findOne({
      where: { id },
      relations: ['sessao_ativa'],
    });
    if (!mesa) {
      throw new NotFoundException('Mesa não encontrada');
    }
    return mesa;
  }

  async create(dto: CreateMesaDto, restauranteId?: string) {
    const tid = resolveRestauranteId(restauranteId);
    const clash = await this.repo.findOne({
      where: { numero: dto.numero, restaurante_id: tid },
    });
    if (clash) {
      throw new ConflictException(`Mesa ${dto.numero} já existe neste restaurante`);
    }
    const mesa = this.repo.create({
      numero: dto.numero,
      status: dto.status ?? MesaStatus.LIVRE,
      restaurante_id: tid,
    });
    const saved = await this.repo.save(mesa);
    saved.qr_code_url = this.mesaUrl(saved.id);
    return this.repo.save(saved);
  }

  async update(id: string, dto: UpdateMesaDto) {
    const mesa = await this.findById(id);
    Object.assign(mesa, dto);
    return this.repo.save(mesa);
  }

  async remove(id: string) {
    const mesa = await this.findById(id);
    await this.repo.remove(mesa);
    return { deleted: true };
  }

  async generateQrCode(id: string): Promise<Buffer> {
    await this.findById(id);
    const url = this.mesaUrl(id);
    return QRCode.toBuffer(url, { type: 'png', margin: 2 });
  }

  getQrTargetUrl(id: string): string {
    return this.mesaUrl(id);
  }
}
