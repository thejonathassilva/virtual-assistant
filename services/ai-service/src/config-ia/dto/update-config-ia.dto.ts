import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ContentFilterStrength } from '../../common/enums';

export class UpdateConfigIaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prompt_sistema?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modelo_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  top_p?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  top_k?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(4096)
  max_tokens?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stop_sequences?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  knowledge_base_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  kb_max_results?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  kb_score_threshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guardrail_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guardrail_version?: string;

  @ApiPropertyOptional({ enum: ContentFilterStrength })
  @IsOptional()
  @IsEnum(ContentFilterStrength)
  content_filter_strength?: ContentFilterStrength;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  grounding_threshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  relevance_threshold?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  temas_bloqueados?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  palavras_bloqueadas?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  updated_by?: string;
}
