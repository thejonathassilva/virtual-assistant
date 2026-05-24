import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { UserRole } from '../entities/usuario.entity';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsString()
  nome!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  restaurante_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(8)
  senha?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
