import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { TablesClient } from '../clients/tables.client';
import { PedidoStatus } from '../common/enums';
import { Pedido } from '../entities/pedido.entity';

const STATUS_ABERTOS = [PedidoStatus.PAGO, PedidoStatus.CANCELADO];

export interface MesaAbertaResumo {
  mesa_id: string;
  pedido_id: string;
  sessao_id: string;
  status: PedidoStatus;
  valor_total: string;
  itens_count: number;
  created_at: Date;
}

@Injectable()
export class CaixaService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    private readonly tablesClient: TablesClient,
  ) {}

  async listarMesasAbertas(): Promise<MesaAbertaResumo[]> {
    const pedidos = await this.pedidoRepo.find({
      where: { status: Not(In(STATUS_ABERTOS)) },
      relations: ['itens'],
      order: { created_at: 'ASC' },
    });

    return pedidos.map((p) => ({
      mesa_id: p.mesa_id,
      pedido_id: p.id,
      sessao_id: p.sessao_id,
      status: p.status,
      valor_total: p.valor_total,
      itens_count: p.itens?.length ?? 0,
      created_at: p.created_at,
    }));
  }

  async obterContaMesa(mesaId: string): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({
      where: {
        mesa_id: mesaId,
        status: Not(In(STATUS_ABERTOS)),
      },
      relations: ['itens'],
      order: { created_at: 'DESC' },
    });

    if (!pedido) {
      throw new NotFoundException(
        `Nenhuma conta aberta encontrada para mesa ${mesaId}`,
      );
    }

    return pedido;
  }

  async fecharPedido(pedidoId: string): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({
      where: { id: pedidoId },
      relations: ['itens'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido ${pedidoId} não encontrado`);
    }

    if (pedido.status === PedidoStatus.PAGO) {
      throw new BadRequestException('Pedido já foi pago');
    }

    if (pedido.status === PedidoStatus.CANCELADO) {
      throw new BadRequestException('Pedido cancelado não pode ser fechado');
    }

    pedido.status = PedidoStatus.PAGO;
    await this.pedidoRepo.save(pedido);

    await this.tablesClient.encerrarSessao(pedido.sessao_id);

    return pedido;
  }
}
