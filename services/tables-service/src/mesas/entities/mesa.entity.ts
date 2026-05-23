import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SessaoMesa } from './sessao-mesa.entity';

export enum MesaStatus {
  LIVRE = 'livre',
  OCUPADA = 'ocupada',
  AGUARDANDO_PAGAMENTO = 'aguardando_pagamento',
}

@Entity('mesas')
export class Mesa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  numero!: number;

  @Column({ nullable: true })
  qr_code_url?: string;

  @Column({ type: 'uuid', nullable: true })
  sessao_ativa_id?: string | null;

  @OneToOne(() => SessaoMesa, { nullable: true })
  @JoinColumn({ name: 'sessao_ativa_id' })
  sessao_ativa?: SessaoMesa | null;

  @Column({ type: 'enum', enum: MesaStatus, default: MesaStatus.LIVRE })
  status!: MesaStatus;

  @OneToMany(() => SessaoMesa, (sessao) => sessao.mesa)
  sessoes!: SessaoMesa[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
