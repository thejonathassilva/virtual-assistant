import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CategoriaProduto } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ example: 'X-Burger Especial' })
  @IsString()
  nome!: string;

  @ApiPropertyOptional({ example: 'Hambúrguer artesanal com queijo e bacon' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 28.9 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  preco!: number;

  @ApiProperty({ enum: CategoriaProduto })
  @IsEnum(CategoriaProduto)
  categoria!: CategoriaProduto;

  @ApiPropertyOptional({ type: [String], example: ['pão', 'carne', 'queijo'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredientes?: string[];

  @ApiPropertyOptional({ type: [String], example: ['gluten', 'lactose'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alergenos?: string[];

  @ApiPropertyOptional({ type: [String], example: ['lanche', 'popular'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Definido automaticamente via upload de foto no admin',
  })
  @IsOptional()
  @IsString()
  foto_url?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsInt()
  @Min(0)
  tempo_preparo_minutos?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
