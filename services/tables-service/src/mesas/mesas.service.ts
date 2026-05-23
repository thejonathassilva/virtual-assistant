import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as QRCode from 'qrcode';
import { Repository } from 'typeorm';
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
    }
  }

  private mesaUrl(id: string): string {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:4201');
    return `${appUrl.replace(/\/$/, '')}/mesa/${id}`;
  }

  private async seedMesas() {
    for (let numero = 1; numero <= 10; numero++) {
      const mesa = this.repo.create({ numero, status: MesaStatus.LIVRE });
      const saved = await this.repo.save(mesa);
      saved.qr_code_url = this.mesaUrl(saved.id);
      await this.repo.save(saved);
    }
  }

  findAll() {
    return this.repo.find({
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

  async create(dto: CreateMesaDto) {
    const mesa = this.repo.create({
      numero: dto.numero,
      status: dto.status ?? MesaStatus.LIVRE,
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
