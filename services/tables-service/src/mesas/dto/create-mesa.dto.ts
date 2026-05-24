import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MesaStatus } from '../entities/mesa.entity';

export class CreateMesaDto {
  @ApiProperty({ example: 11 })
  @IsInt()
  @Min(1)
  numero!: number;

  @ApiPropertyOptional({ enum: MesaStatus, default: MesaStatus.LIVRE })
  @IsOptional()
  @IsEnum(MesaStatus)
  status?: MesaStatus;

  @ApiPropertyOptional({ example: 'duas-maos-uma-mesa' })
  @IsOptional()
  @IsString()
  restaurante_slug?: string;
}
