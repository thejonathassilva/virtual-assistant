import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ItemPedidoStatus } from '../../common/enums';

export class UpdateItemStatusDto {
  @ApiProperty({ enum: ItemPedidoStatus })
  @IsEnum(ItemPedidoStatus)
  status!: ItemPedidoStatus;
}
