import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PedidoOrigem } from '../../common/enums';

export class CreatePedidoDto {
  @ApiProperty()
  @IsUUID()
  mesa_id!: string;

  @ApiProperty()
  @IsUUID()
  sessao_id!: string;

  @ApiProperty({ enum: PedidoOrigem })
  @IsEnum(PedidoOrigem)
  origem!: PedidoOrigem;

  @ApiPropertyOptional({
    description: 'Envia o pedido à cozinha e notifica o realtime-service',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  enviar_cozinha?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  restaurante_id?: string;
}
