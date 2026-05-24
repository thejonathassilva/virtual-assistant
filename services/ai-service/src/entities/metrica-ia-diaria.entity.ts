import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('metrica_ia_diaria')
@Unique(['restaurante_id', 'data'])
export class MetricaIaDiaria {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', default: '11111111-1111-4111-8111-111111111111' })
  restaurante_id!: string;

  @Column({ type: 'date' })
  data!: string;

  @Column({ type: 'int', default: 0 })
  total_conversas!: number;

  @Column({ type: 'int', default: 0 })
  pedidos_completados_ia!: number;

  @Column({ type: 'int', default: 0 })
  fallbacks_garcom!: number;

  @Column({ type: 'float', default: 0 })
  tempo_medio_conversa_segundos!: number;

  @Column({ type: 'float', default: 0 })
  latencia_media_ms!: number;

  @Column({ type: 'int', default: 0 })
  tokens_consumidos_input!: number;

  @Column({ type: 'int', default: 0 })
  tokens_consumidos_output!: number;

  @Column({ type: 'int', default: 0 })
  guardrails_acionados!: number;

  @Column({ type: 'float', default: 0 })
  custo_estimado_usd!: number;

  @Column({ nullable: true })
  modelo_mais_usado?: string;

  @Column({ nullable: true })
  tool_mais_chamada?: string;

  @Column({ nullable: true })
  produto_mais_pedido_ia?: string;
}
