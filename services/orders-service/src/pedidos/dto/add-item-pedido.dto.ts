import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AddItemPedidoDto {
  @ApiProperty()
  @IsUUID()
  produto_id!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantidade!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
