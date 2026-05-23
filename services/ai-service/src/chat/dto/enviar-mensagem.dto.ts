import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class EnviarMensagemDto {
  @ApiProperty({ description: 'Texto da mensagem do cliente' })
  @IsString()
  @MinLength(1)
  mensagem!: string;

  @ApiPropertyOptional({ description: 'ID da sessão (opcional, gerado automaticamente)' })
  @IsOptional()
  @IsUUID()
  sessao_id?: string;
}
