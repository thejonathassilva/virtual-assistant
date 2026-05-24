import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PedidoOrigem, PedidoStatus } from '../common/enums';
import { ItemPedido } from './item-pedido.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  mesa_id!: string;

  @Column({ type: 'uuid', name: 'restaurante_id' })
  restaurante_id!: string;

  @Column({ type: 'uuid' })
  sessao_id!: string;

  @Column({ type: 'enum', enum: PedidoStatus, default: PedidoStatus.ABERTO })
  status!: PedidoStatus;

  @Column({ type: 'enum', enum: PedidoOrigem })
  origem!: PedidoOrigem;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valor_total!: string;

  @OneToMany(() => ItemPedido, (item) => item.pedido, { cascade: true })
  itens!: ItemPedido[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
