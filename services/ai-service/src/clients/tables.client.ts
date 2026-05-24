import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_RESTAURANTE_ID } from '../common/tenant';

export interface MesaInfo {
  id: string;
  numero: number;
  restaurante_id?: string;
  status: string;
}

@Injectable()
export class TablesClient {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl =
      config.get<string>('TABLES_SERVICE_URL') ?? 'http://tables-service:3003';
  }

  async getMesa(mesaId: string): Promise<MesaInfo> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/mesas/${mesaId}`;
    const { data } = await firstValueFrom(this.http.get<MesaInfo>(url));
    return data;
  }

  async resolveRestauranteId(mesaId: string): Promise<string> {
    try {
      const mesa = await this.getMesa(mesaId);
      return mesa.restaurante_id?.trim() || DEFAULT_RESTAURANTE_ID;
    } catch {
      return DEFAULT_RESTAURANTE_ID;
    }
  }
}
