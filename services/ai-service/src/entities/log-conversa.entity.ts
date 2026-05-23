import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('log_conversa')
export class LogConversa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  sessao_id!: string;

  @Column('uuid')
  mesa_id!: string;

  @Column({ type: 'jsonb', default: [] })
  mensagens!: Record<string, unknown>[];

  @Column({ default: false })
  pedido_finalizado!: boolean;

  @Column({ default: false })
  fallback_garcom!: boolean;

  @Column({ type: 'int', default: 0 })
  total_mensagens!: number;

  @Column({ type: 'int', default: 0 })
  total_tool_calls!: number;

  @Column({ type: 'int', default: 0 })
  total_tokens_input!: number;

  @Column({ type: 'int', default: 0 })
  total_tokens_output!: number;

  @Column({ type: 'float', default: 0 })
  latencia_media_ms!: number;

  @Column({ type: 'int', default: 0 })
  guardrails_acionados!: number;

  @Column({ type: 'float', default: 0 })
  custo_estimado_usd!: number;

  @Column({ type: 'float', default: 0 })
  duracao_segundos!: number;

  @CreateDateColumn()
  created_at!: Date;
}
