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
      }
      if (!m.restaurante_slug) {
        m.restaurante_slug = 'duas-maos-uma-mesa';
      }
      await this.repo.save(this.applyQrUrl(m, m.restaurante_slug));
    }
  }

  private mesaUrl(id: string, slug?: string | null): string {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:4201');
    const base = appUrl.replace(/\/$/, '');
    if (slug?.trim()) {
      return `${base}/r/${slug.trim()}/mesa/${id}`;
    }
    return `${base}/mesa/${id}`;
  }

  private applyQrUrl(mesa: Mesa, slug?: string | null): Mesa {
    mesa.qr_code_url = this.mesaUrl(mesa.id, slug ?? mesa.restaurante_slug);
    return mesa;
  }

  private async seedMesas() {
    await this.seedMesasForTenant(DEFAULT_RESTAURANTE_ID, 10);
  }

  async seedMesasForTenant(
    restauranteId: string,
    quantidade = 5,
    restauranteSlug?: string,
  ) {
    const tid = resolveRestauranteId(restauranteId);
    const slug = restauranteSlug?.trim() || undefined;
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
        restaurante_slug: slug,
      });
      const saved = await this.repo.save(mesa);
      criadas.push(await this.repo.save(this.applyQrUrl(saved, slug)));
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

  async create(
    dto: CreateMesaDto,
    restauranteId?: string,
    restauranteSlug?: string,
  ) {
    const tid = resolveRestauranteId(restauranteId);
    const slug = restauranteSlug?.trim() || dto.restaurante_slug?.trim();
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
      restaurante_slug: slug,
    });
    const saved = await this.repo.save(mesa);
    return this.repo.save(this.applyQrUrl(saved, slug));
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
    const mesa = await this.findById(id);
    const url = this.mesaUrl(mesa.id, mesa.restaurante_slug);
    return QRCode.toBuffer(url, { type: 'png', margin: 2 });
  }

  async getQrTargetUrl(id: string): Promise<string> {
    const mesa = await this.findById(id);
    return this.mesaUrl(mesa.id, mesa.restaurante_slug);
  }

  async refreshQrUrlsForTenant(restauranteId: string, slug: string) {
    const mesas = await this.repo.find({
      where: { restaurante_id: restauranteId },
    });
    for (const m of mesas) {
      m.restaurante_slug = slug;
      await this.repo.save(this.applyQrUrl(m, slug));
    }
  }
}
