import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@restaurante.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Restaurante@123' })
  @IsString()
  @MinLength(8)
  senha!: string;
}
