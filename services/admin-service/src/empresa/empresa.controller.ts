import { Body, Controller, Get, Headers, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadLogoDto } from './dto/upload-logo.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { EmpresaService } from './empresa.service';

@ApiTags('empresa')
@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Get()
  @ApiOperation({ summary: 'Dados da empresa' })
  getEmpresa(@Headers('x-restaurante-id') restauranteId?: string) {
    return this.empresaService.getEmpresa(restauranteId);
  }

  @Put()
  @ApiOperation({ summary: 'Atualizar dados da empresa' })
  updateEmpresa(
    @Headers('x-restaurante-id') restauranteId: string,
    @Body() dto: UpdateEmpresaDto,
  ) {
    return this.empresaService.updateEmpresa(dto, restauranteId);
  }

  @Post('logo')
  @ApiOperation({ summary: 'Atualizar URL do logo' })
  uploadLogo(
    @Headers('x-restaurante-id') restauranteId: string,
    @Body() dto: UploadLogoDto,
  ) {
    return this.empresaService.updateLogo(dto.logo_url, restauranteId);
  }
}
