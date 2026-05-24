import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRestauranteDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  nome!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1000)
  token_quota_mensal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  quota_ilimitada?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  clonar_cardapio_modelo?: boolean;
}
