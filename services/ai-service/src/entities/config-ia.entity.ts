import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContentFilterStrength } from '../common/enums';

@Entity('config_ia')
export class ConfigIa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  prompt_sistema!: string;

  @Column()
  modelo_id!: string;

  @Column({ type: 'float', default: 0.3 })
  temperature!: number;

  @Column({ type: 'float', default: 0.9 })
  top_p!: number;

  @Column({ type: 'int', default: 50 })
  top_k!: number;

  @Column({ type: 'int', default: 1024 })
  max_tokens!: number;

  @Column({ type: 'varchar', array: true, default: [] })
  stop_sequences!: string[];

  @Column({ nullable: true })
  knowledge_base_id?: string;

  @Column({ type: 'int', default: 5 })
  kb_max_results!: number;

  @Column({ type: 'float', default: 0.5 })
  kb_score_threshold!: number;

  @Column({ nullable: true })
  guardrail_id?: string;

  @Column({ nullable: true, default: '1' })
  guardrail_version?: string;

  @Column({
    type: 'enum',
    enum: ContentFilterStrength,
    default: ContentFilterStrength.MEDIUM,
  })
  content_filter_strength!: ContentFilterStrength;

  @Column({ type: 'float', default: 0.7 })
  grounding_threshold!: number;

  @Column({ type: 'float', default: 0.7 })
  relevance_threshold!: number;

  @Column({ type: 'varchar', array: true, default: [] })
  temas_bloqueados!: string[];

  @Column({ type: 'varchar', array: true, default: [] })
  palavras_bloqueadas!: string[];

  @Column({ nullable: true })
  updated_by?: string;

  @UpdateDateColumn()
  updated_at!: Date;
}
