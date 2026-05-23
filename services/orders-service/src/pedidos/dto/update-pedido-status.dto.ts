import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PedidoStatus } from '../../common/enums';

export class UpdatePedidoStatusDto {
  @ApiProperty({ enum: PedidoStatus })
  @IsEnum(PedidoStatus)
  status!: PedidoStatus;
}
