import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ItemPedidoStatus } from '../common/enums';
import { Pedido } from './pedido.entity';

@Entity('itens_pedido')
export class ItemPedido {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  pedido_id!: string;

  @Column({ type: 'uuid' })
  produto_id!: string;

  @Column({ type: 'int' })
  quantidade!: number;

  @Column({ type: 'text', nullable: true })
  observacoes!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco_unitario!: string;

  @Column({
    type: 'enum',
    enum: ItemPedidoStatus,
    default: ItemPedidoStatus.PENDENTE,
  })
  status!: ItemPedidoStatus;

  @ManyToOne(() => Pedido, (pedido) => pedido.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido!: Pedido;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
