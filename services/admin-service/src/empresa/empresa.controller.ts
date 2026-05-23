import { Body, Controller, Get, Post, Put } from '@nestjs/common';
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
  getEmpresa() {
    return this.empresaService.getEmpresa();
  }

  @Put()
  @ApiOperation({ summary: 'Atualizar dados da empresa' })
  updateEmpresa(@Body() dto: UpdateEmpresaDto) {
    return this.empresaService.updateEmpresa(dto);
  }

  @Post('logo')
  @ApiOperation({ summary: 'Atualizar URL do logo' })
  uploadLogo(@Body() dto: UploadLogoDto) {
    return this.empresaService.updateLogo(dto.logo_url);
  }
}
