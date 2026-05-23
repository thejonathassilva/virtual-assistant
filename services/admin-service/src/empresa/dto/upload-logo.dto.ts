import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, MaxLength } from 'class-validator';

export class UploadLogoDto {
  @ApiProperty({ description: 'URL pública do logo' })
  @IsUrl()
  @MaxLength(500)
  logo_url!: string;
}
