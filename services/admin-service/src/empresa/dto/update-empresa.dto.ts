import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateEmpresaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  missao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  visao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valores?: string;

  @ApiPropertyOptional({ example: { segunda_a_sexta: '11:00-22:00' } })
  @IsOptional()
  @IsObject()
  horario_funcionamento?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  endereco?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefone?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  formas_pagamento?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  politica_cancelamento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  historia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  logo_url?: string;
}
