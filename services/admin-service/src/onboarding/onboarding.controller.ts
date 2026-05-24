import { Controller, Get, Headers } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { EmpresaService } from '../empresa/empresa.service';

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly empresa: EmpresaService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Status do onboarding do restaurante' })
  async status(@Headers('x-restaurante-id') restauranteId?: string) {
    const empresa = await this.empresa.getEmpresa(restauranteId);
    const produtos = await this.countProdutos(restauranteId);
    const mesas = await this.countMesas(restauranteId);

    const empresaOk =
      !!empresa.endereco?.trim() &&
      !!empresa.telefone?.trim() &&
      !!empresa.missao?.trim();

    const steps = {
      empresa: empresaOk,
      produtos: produtos >= 1,
      mesas: mesas >= 1,
    };

    return {
      steps,
      counts: { produtos, mesas },
      complete: steps.empresa && steps.produtos && steps.mesas,
    };
  }

  private catalogUrl(): string {
    return (
      this.config.get<string>('CATALOG_SERVICE_URL') ??
      'http://catalog-service:3002'
    ).replace(/\/$/, '');
  }

  private tablesUrl(): string {
    return (
      this.config.get<string>('TABLES_SERVICE_URL') ?? 'http://tables-service:3003'
    ).replace(/\/$/, '');
  }

  private headers(restauranteId?: string) {
    return restauranteId
      ? { 'x-restaurante-id': restauranteId }
      : {};
  }

  private async countProdutos(restauranteId?: string): Promise<number> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<unknown[]>(`${this.catalogUrl()}/produtos`, {
          headers: this.headers(restauranteId),
        }),
      );
      return Array.isArray(data) ? data.length : 0;
    } catch {
      return 0;
    }
  }

  private async countMesas(restauranteId?: string): Promise<number> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<unknown[]>(`${this.tablesUrl()}/mesas`, {
          headers: this.headers(restauranteId),
        }),
      );
      return Array.isArray(data) ? data.length : 0;
    } catch {
      return 0;
    }
  }
}
