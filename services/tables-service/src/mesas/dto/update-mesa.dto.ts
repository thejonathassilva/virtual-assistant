import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { MesaStatus } from '../entities/mesa.entity';

export class UpdateMesaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  numero?: number;

  @ApiPropertyOptional({ enum: MesaStatus })
  @IsOptional()
  @IsEnum(MesaStatus)
  status?: MesaStatus;
}
