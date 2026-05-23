import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Mesa } from './mesa.entity';

export enum SessaoStatus {
  ATIVA = 'ativa',
  ENCERRADA = 'encerrada',
}

@Entity('sessoes_mesa')
export class SessaoMesa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  mesa_id!: string;

  @ManyToOne(() => Mesa, (mesa) => mesa.sessoes)
  @JoinColumn({ name: 'mesa_id' })
  mesa!: Mesa;

  @Column({ type: 'timestamptz' })
  inicio!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  fim?: Date | null;

  @Column({ type: 'enum', enum: SessaoStatus, default: SessaoStatus.ATIVA })
  status!: SessaoStatus;

  @CreateDateColumn()
  created_at!: Date;
}
