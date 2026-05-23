import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CategoriaProduto {
  ENTRADAS = 'entradas',
  PRATOS_PRINCIPAIS = 'pratos_principais',
  BEBIDAS = 'bebidas',
  SOBREMESAS = 'sobremesas',
}

@Entity('produtos')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  nome!: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco!: string;

  @Column({ type: 'enum', enum: CategoriaProduto })
  categoria!: CategoriaProduto;

  @Column({ type: 'varchar', array: true, default: [] })
  ingredientes!: string[];

  @Column({ type: 'varchar', array: true, default: [] })
  alergenos!: string[];

  @Column({ type: 'varchar', array: true, default: [] })
  tags!: string[];

  @Column({ nullable: true })
  foto_url?: string;

  @Column({ type: 'int', default: 0 })
  tempo_preparo_minutos!: number;

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
