import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ItemPedidoStatus, PedidoStatus } from '../common/enums';
import { ItemPedido } from '../entities/item-pedido.entity';
import { Pedido } from '../entities/pedido.entity';

const STATUS_COZINHA_PEDIDO = [
  PedidoStatus.ENVIADO_COZINHA,
  PedidoStatus.EM_PREPARO,
  PedidoStatus.PRONTO,
];

const STATUS_COZINHA_ITEM = [
  ItemPedidoStatus.PENDENTE,
  ItemPedidoStatus.EM_PREPARO,
  ItemPedidoStatus.PRONTO,
];

@Injectable()
export class CozinhaService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    @InjectRepository(ItemPedido)
    private readonly itemRepo: Repository<ItemPedido>,
  ) {}

  async listarPedidos(): Promise<Pedido[]> {
    return this.pedidoRepo.find({
      where: { status: In(STATUS_COZINHA_PEDIDO) },
      relations: ['itens'],
      order: { created_at: 'ASC' },
    });
  }

  async estatisticas(): Promise<{
    pedidos_na_fila: number;
    itens_pendentes: number;
    itens_em_preparo: number;
    itens_prontos: number;
    pedidos_por_status: Record<string, number>;
  }> {
    const pedidos = await this.pedidoRepo.find({
      where: { status: In(STATUS_COZINHA_PEDIDO) },
    });

    const itens = await this.itemRepo.find({
      where: { status: In(STATUS_COZINHA_ITEM) },
    });

    const pedidos_por_status: Record<string, number> = {};
    for (const status of STATUS_COZINHA_PEDIDO) {
      pedidos_por_status[status] = pedidos.filter((p) => p.status === status).length;
    }

    return {
      pedidos_na_fila: pedidos.length,
      itens_pendentes: itens.filter((i) => i.status === ItemPedidoStatus.PENDENTE)
        .length,
      itens_em_preparo: itens.filter(
        (i) => i.status === ItemPedidoStatus.EM_PREPARO,
      ).length,
      itens_prontos: itens.filter((i) => i.status === ItemPedidoStatus.PRONTO)
        .length,
      pedidos_por_status,
    };
  }
}
