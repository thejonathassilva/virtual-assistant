import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigIaService } from './config-ia.service';
import { TesteConfigDto } from './dto/teste-config.dto';
import { UpdateConfigIaDto } from './dto/update-config-ia.dto';

@ApiTags('config-ia')
@Controller('config-ia')
export class ConfigIaController {
  constructor(private readonly configIaService: ConfigIaService) {}

  @Get()
  @ApiOperation({ summary: 'Obter configuracao atual da IA' })
  getConfig() {
    return this.configIaService.getConfig();
  }

  @Put()
  @ApiOperation({ summary: 'Atualizar configuracao da IA' })
  updateConfig(@Body() dto: UpdateConfigIaDto) {
    return this.configIaService.updateConfig(dto);
  }

  @Post('teste')
  @ApiOperation({ summary: 'Testar assistente com configuracao atual' })
  testConfig(@Body() dto: TesteConfigDto) {
    return this.configIaService.testConfig(dto);
  }

  @Post('resetar')
  @ApiOperation({ summary: 'Resetar configuracao para valores padrao' })
  resetConfig() {
    return this.configIaService.resetConfig();
  }
}
