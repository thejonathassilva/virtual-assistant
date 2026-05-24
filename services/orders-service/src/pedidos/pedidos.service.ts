import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CatalogClient } from '../clients/catalog.client';
import { RealtimeClient } from '../clients/realtime.client';
import { ItemPedidoStatus, PedidoStatus } from '../common/enums';
import { ItemPedido } from '../entities/item-pedido.entity';
import { Pedido } from '../entities/pedido.entity';
import { AddItemPedidoDto } from './dto/add-item-pedido.dto';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { resolveRestauranteId } from '../common/tenant';
import { ListPedidosQueryDto } from './dto/list-pedidos-query.dto';

const STATUS_FINAIS = [PedidoStatus.PAGO, PedidoStatus.CANCELADO];

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    @InjectRepository(ItemPedido)
    private readonly itemRepo: Repository<ItemPedido>,
    private readonly catalog: CatalogClient,
    private readonly realtime: RealtimeClient,
  ) {}

  async create(dto: CreatePedidoDto, restauranteId?: string): Promise<Pedido> {
    const tid = resolveRestauranteId(restauranteId ?? dto.restaurante_id);
    const existente = await this.findPedidoAtualByMesa(dto.mesa_id);
    if (existente) {
      throw new BadRequestException(
        `Mesa ${dto.mesa_id} já possui pedido aberto (${existente.id})`,
      );
    }

    const pedido = this.pedidoRepo.create({
      mesa_id: dto.mesa_id,
      sessao_id: dto.sessao_id,
      restaurante_id: tid,
      origem: dto.origem,
      status: PedidoStatus.ABERTO,
      valor_total: '0',
      itens: [],
    });

    const salvo = await this.pedidoRepo.save(pedido);

    if (dto.enviar_cozinha) {
      return this.enviarCozinha(salvo.id);
    }

    return this.findOne(salvo.id);
  }

  async findAll(
    query: ListPedidosQueryDto,
    restauranteId?: string,
  ): Promise<Pedido[]> {
    const where: Record<string, unknown> = {};
    if (restauranteId) where.restaurante_id = resolveRestauranteId(restauranteId);
    if (query.mesa_id) where.mesa_id = query.mesa_id;
    if (query.status) where.status = query.status;

    return this.pedidoRepo.find({
      where,
      relations: ['itens'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({
      where: { id },
      relations: ['itens'],
    });
    if (!pedido) {
      throw new NotFoundException(`Pedido ${id} não encontrado`);
    }
    return pedido;
  }

  async findPedidoAtualByMesa(mesaId: string): Promise<Pedido | null> {
    return this.pedidoRepo.findOne({
      where: {
        mesa_id: mesaId,
        status: Not(In(STATUS_FINAIS)),
      },
      relations: ['itens'],
      order: { created_at: 'DESC' },
    });
  }

  async addItem(pedidoId: string, dto: AddItemPedidoDto): Promise<Pedido> {
    const pedido = await this.findOne(pedidoId);

    if (STATUS_FINAIS.includes(pedido.status)) {
      throw new BadRequestException('Pedido encerrado não aceita novos itens');
    }

    const produto = await this.catalog.getProduto(dto.produto_id);

    const item = this.itemRepo.create({
      pedido_id: pedido.id,
      produto_id: dto.produto_id,
      quantidade: dto.quantidade,
      observacoes: dto.observacoes ?? null,
      preco_unitario: String(produto.preco),
      status: ItemPedidoStatus.PENDENTE,
    });

    await this.itemRepo.save(item);
    await this.recalcularValorTotal(pedido.id);

    return this.findOne(pedido.id);
  }

  async removeItem(pedidoId: string, itemId: string): Promise<Pedido> {
    const pedido = await this.findOne(pedidoId);

    if (STATUS_FINAIS.includes(pedido.status)) {
      throw new BadRequestException('Pedido encerrado não permite remover itens');
    }

    const item = pedido.itens.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException(`Item ${itemId} não encontrado no pedido`);
    }

    if (item.status !== ItemPedidoStatus.PENDENTE) {
      throw new BadRequestException(
        'Somente itens pendentes podem ser removidos',
      );
    }

    await this.itemRepo.remove(item);
    await this.recalcularValorTotal(pedido.id);

    return this.findOne(pedido.id);
  }

  async updateStatus(pedidoId: string, status: PedidoStatus): Promise<Pedido> {
    const pedido = await this.findOne(pedidoId);
    if (STATUS_FINAIS.includes(pedido.status)) {
      throw new BadRequestException('Pedido encerrado');
    }
    pedido.status = status;
    await this.pedidoRepo.save(pedido);
    const atualizado = await this.findOne(pedidoId);
    if (status === PedidoStatus.PRONTO) {
      await this.realtime.emitPedidoPronto(atualizado);
    } else {
      await this.realtime.emitPedidoAtualizado(atualizado);
    }
    return atualizado;
  }

  async updateItemStatus(
    pedidoId: string,
    itemId: string,
    status: ItemPedidoStatus,
  ): Promise<Pedido> {
    const pedido = await this.findOne(pedidoId);
    const item = pedido.itens.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException(`Item ${itemId} não encontrado`);
    }
    item.status = status;
    await this.itemRepo.save(item);

    const todosProntos = pedido.itens.every(
      (i) =>
        i.status === ItemPedidoStatus.PRONTO ||
        i.status === ItemPedidoStatus.CANCELADO,
    );
    if (todosProntos && pedido.status === PedidoStatus.EM_PREPARO) {
      return this.updateStatus(pedidoId, PedidoStatus.PRONTO);
    }
    if (status === ItemPedidoStatus.EM_PREPARO && pedido.status === PedidoStatus.ENVIADO_COZINHA) {
      pedido.status = PedidoStatus.EM_PREPARO;
      await this.pedidoRepo.save(pedido);
    }

    const atualizado = await this.findOne(pedidoId);
    await this.realtime.emitPedidoAtualizado(atualizado);
    return atualizado;
  }

  async enviarCozinha(pedidoId: string): Promise<Pedido> {
    const pedido = await this.findOne(pedidoId);

    if (STATUS_FINAIS.includes(pedido.status)) {
      throw new BadRequestException('Pedido já encerrado');
    }

    if (!pedido.itens?.length) {
      throw new BadRequestException('Pedido sem itens não pode ir à cozinha');
    }

    if (pedido.status === PedidoStatus.ABERTO) {
      pedido.status = PedidoStatus.ENVIADO_COZINHA;
      await this.pedidoRepo.save(pedido);
      const completo = await this.findOne(pedido.id);
      await this.realtime.emitNovoPedido(completo);
      return completo;
    }

    return pedido;
  }

  private async recalcularValorTotal(pedidoId: string): Promise<void> {
    const itens = await this.itemRepo.find({
      where: {
        pedido_id: pedidoId,
        status: Not(ItemPedidoStatus.CANCELADO),
      },
    });

    const total = itens.reduce(
      (acc, item) =>
        acc + Number(item.preco_unitario) * item.quantidade,
      0,
    );

    await this.pedidoRepo.update(pedidoId, {
      valor_total: total.toFixed(2),
    });
  }
}
