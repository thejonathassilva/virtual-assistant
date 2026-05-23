import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PedidoStatus } from '../../common/enums';

export class ListPedidosQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  mesa_id?: string;

  @ApiPropertyOptional({ enum: PedidoStatus })
  @IsOptional()
  @IsEnum(PedidoStatus)
  status?: PedidoStatus;
}
