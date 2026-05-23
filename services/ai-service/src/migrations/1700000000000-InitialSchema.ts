import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."config_ia_content_filter_strength_enum" AS ENUM(
          'LOW', 'MEDIUM', 'HIGH'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "config_ia" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "prompt_sistema" text NOT NULL,
        "modelo_id" character varying NOT NULL,
        "temperature" double precision NOT NULL DEFAULT 0.3,
        "top_p" double precision NOT NULL DEFAULT 0.9,
        "top_k" integer NOT NULL DEFAULT 50,
        "max_tokens" integer NOT NULL DEFAULT 1024,
        "stop_sequences" character varying array NOT NULL DEFAULT '{}',
        "knowledge_base_id" character varying,
        "kb_max_results" integer NOT NULL DEFAULT 5,
        "kb_score_threshold" double precision NOT NULL DEFAULT 0.5,
        "guardrail_id" character varying,
        "guardrail_version" character varying DEFAULT '1',
        "content_filter_strength" "public"."config_ia_content_filter_strength_enum" NOT NULL DEFAULT 'MEDIUM',
        "grounding_threshold" double precision NOT NULL DEFAULT 0.7,
        "relevance_threshold" double precision NOT NULL DEFAULT 0.7,
        "temas_bloqueados" character varying array NOT NULL DEFAULT '{}',
        "palavras_bloqueadas" character varying array NOT NULL DEFAULT '{}',
        "updated_by" character varying,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_config_ia" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "log_conversa" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sessao_id" character varying NOT NULL,
        "mesa_id" uuid NOT NULL,
        "mensagens" jsonb NOT NULL DEFAULT '[]',
        "tokens_input" integer NOT NULL DEFAULT 0,
        "tokens_output" integer NOT NULL DEFAULT 0,
        "latencia_ms" integer NOT NULL DEFAULT 0,
        "tool_calls" jsonb NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_log_conversa" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "metrica_ia_diaria" (
        "data" date NOT NULL,
        "total_conversas" integer NOT NULL DEFAULT 0,
        "pedidos_completados_ia" integer NOT NULL DEFAULT 0,
        "fallbacks_garcom" integer NOT NULL DEFAULT 0,
        "tokens_consumidos_input" integer NOT NULL DEFAULT 0,
        "tokens_consumidos_output" integer NOT NULL DEFAULT 0,
        "custo_estimado_usd" numeric(10,4) NOT NULL DEFAULT 0,
        CONSTRAINT "PK_metrica_ia_diaria" PRIMARY KEY ("data")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "metrica_ia_diaria"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "log_conversa"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "config_ia"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."config_ia_content_filter_strength_enum"`);
  }
}
