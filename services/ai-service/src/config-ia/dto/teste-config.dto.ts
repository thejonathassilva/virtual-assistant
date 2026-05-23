import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class TesteConfigDto {
  @ApiProperty({ description: 'Mensagem de teste para o assistente' })
  @IsString()
  @MinLength(1)
  mensagem!: string;

  @ApiPropertyOptional({ description: 'Mesa simulada para o teste' })
  @IsOptional()
  @IsUUID()
  mesa_id?: string;
}
