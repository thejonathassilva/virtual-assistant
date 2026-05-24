import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('restaurantes')
export class Restaurante {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  nome!: string;

  @Column({ default: true })
  ativo!: boolean;

  /** Cota mensal de tokens; null se ilimitado. */
  @Column({ type: 'int', nullable: true })
  token_quota_mensal!: number | null;

  @Column({ type: 'int', default: 0 })
  tokens_usados_mes!: number;

  @Column({ name: 'quota_ilimitada', default: false })
  quota_ilimitada!: boolean;

  @Column({ type: 'date', name: 'quota_renovacao_em' })
  quota_renovacao_em!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
