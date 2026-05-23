import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ItemPedidoPayloadDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsUUID()
  produto_id?: string;

  @IsOptional()
  @IsNumber()
  quantidade?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsNumber()
  preco_unitario?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

/** Corpo aceito nos POST /events/* (campos extras de serviços upstream são preservados). */
export class EmitEventDto {
  @IsOptional()
  @IsUUID()
  mesa_id?: string;

  @IsOptional()
  @IsUUID()
  pedido_id?: string;

  @IsOptional()
  @IsUUID()
  sessao_id?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  origem?: string;

  @IsOptional()
  @IsNumber()
  valor_total?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoPayloadDto)
  itens?: ItemPedidoPayloadDto[];

  @IsOptional()
  created_at?: string | Date;

  @IsOptional()
  @IsString()
  mensagem?: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}
