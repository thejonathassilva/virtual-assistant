import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('empresa')
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  nome!: string;

  @Column({ type: 'text', nullable: true })
  missao!: string | null;

  @Column({ type: 'text', nullable: true })
  visao!: string | null;

  @Column({ type: 'text', nullable: true })
  valores!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  horario_funcionamento!: Record<string, string> | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  endereco!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefone!: string | null;

  @Column({ type: 'varchar', array: true, default: '{}' })
  formas_pagamento!: string[];

  @Column({ type: 'text', nullable: true })
  politica_cancelamento!: string | null;

  @Column({ type: 'text', nullable: true })
  historia!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
