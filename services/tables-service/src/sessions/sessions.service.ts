import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mesa, MesaStatus } from '../mesas/entities/mesa.entity';
import {
  SessaoMesa,
  SessaoStatus,
} from '../mesas/entities/sessao-mesa.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessaoMesa)
    private readonly sessaoRepo: Repository<SessaoMesa>,
    @InjectRepository(Mesa)
    private readonly mesaRepo: Repository<Mesa>,
  ) {}

  async openSession(mesaId: string): Promise<SessaoMesa> {
    const mesa = await this.mesaRepo.findOne({ where: { id: mesaId } });
    if (!mesa) {
      throw new NotFoundException('Mesa não encontrada');
    }
    if (mesa.sessao_ativa_id) {
      throw new BadRequestException('Mesa já possui sessão ativa');
    }
    if (mesa.status !== MesaStatus.LIVRE) {
      throw new BadRequestException('Mesa não está livre para abrir sessão');
    }

    const sessao = this.sessaoRepo.create({
      mesa_id: mesaId,
      inicio: new Date(),
      status: SessaoStatus.ATIVA,
    });
    const saved = await this.sessaoRepo.save(sessao);

    mesa.sessao_ativa_id = saved.id;
    mesa.status = MesaStatus.OCUPADA;
    await this.mesaRepo.save(mesa);

    return saved;
  }

  async closeSession(mesaId: string): Promise<SessaoMesa> {
    const mesa = await this.mesaRepo.findOne({ where: { id: mesaId } });
    if (!mesa) {
      throw new NotFoundException('Mesa não encontrada');
    }
    if (!mesa.sessao_ativa_id) {
      throw new BadRequestException('Mesa não possui sessão ativa');
    }

    const sessao = await this.sessaoRepo.findOne({
      where: { id: mesa.sessao_ativa_id },
    });
    if (!sessao) {
      throw new NotFoundException('Sessão ativa não encontrada');
    }

    sessao.fim = new Date();
    sessao.status = SessaoStatus.ENCERRADA;
    await this.sessaoRepo.save(sessao);

    mesa.sessao_ativa_id = null;
    mesa.status = MesaStatus.LIVRE;
    await this.mesaRepo.save(mesa);

    return sessao;
  }

  async findActiveByMesaId(mesaId: string): Promise<SessaoMesa | null> {
    return this.sessaoRepo.findOne({
      where: { mesa_id: mesaId, status: SessaoStatus.ATIVA },
    });
  }

  async closeSessionById(sessaoId: string): Promise<SessaoMesa> {
    const sessao = await this.sessaoRepo.findOne({ where: { id: sessaoId } });
    if (!sessao || sessao.status !== SessaoStatus.ATIVA) {
      throw new NotFoundException('Sessão ativa não encontrada');
    }
    return this.closeSession(sessao.mesa_id);
  }
}
