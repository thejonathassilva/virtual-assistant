import { HttpService } from '@nestjs/axios';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { DEFAULT_RESTAURANTE_ID } from '../common/tenant.constants';
import { EmpresaService } from '../empresa/empresa.service';
import { CreateRestauranteDto } from './dto/create-restaurante.dto';
import { UpdateRestauranteDto } from './dto/update-restaurante.dto';
import { Restaurante } from './entities/restaurante.entity';

export { DEFAULT_RESTAURANTE_ID } from '../common/tenant.constants';
const USD_TO_BRL = 6;
const UNLIMITED_DISPLAY_MULT = 10;

@Injectable()
export class RestauranteService implements OnModuleInit {
  private readonly logger = new Logger(RestauranteService.name);

  constructor(
    @InjectRepository(Restaurante)
    private readonly repo: Repository<Restaurante>,
    private readonly empresaService: EmpresaService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedDefault();
    const renovados = await this.renovarCotasVencidas();
    if (renovados > 0) {
      this.logger.log(`Cotas renovadas na inicialização: ${renovados}`);
    }
    const intervalHours = Number(
      this.config.get<string>('QUOTA_RENEWAL_CHECK_HOURS') ?? '24',
    );
    if (intervalHours > 0) {
      setInterval(
        () => void this.renovarCotasVencidas(),
        intervalHours * 60 * 60 * 1000,
      );
    }
  }

  /** Primeiro dia do mês seguinte (UTC). */
  private nextRenewalDate(from = new Date()): string {
    const d = new Date(from);
    d.setUTCMonth(d.getUTCMonth() + 1);
    d.setUTCDate(1);
    return d.toISOString().slice(0, 10);
  }

  private todayUtc(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private isRenewalDue(renovacaoEm: string): boolean {
    return renovacaoEm <= this.todayUtc();
  }

  /**
   * Zera tokens_usados_mes quando quota_renovacao_em <= hoje
   * e agenda a próxima renovação para o dia 1 do mês seguinte.
   */
  private async aplicarRenovacaoSeVencida(row: Restaurante): Promise<Restaurante> {
    if (!this.isRenewalDue(row.quota_renovacao_em)) {
      return row;
    }
    const anterior = row.tokens_usados_mes;
    row.tokens_usados_mes = 0;
    row.quota_renovacao_em = this.nextRenewalDate();
    const saved = await this.repo.save(row);
    this.logger.log(
      `Cota renovada: ${saved.nome} (${saved.id}) — ${anterior} tokens zerados; próxima renovação em ${saved.quota_renovacao_em}`,
    );
    return saved;
  }

  /** Varre todos os tenants e renova cotas vencidas. */
  async renovarCotasVencidas(): Promise<number> {
    const rows = await this.repo.find();
    let count = 0;
    for (const row of rows) {
      if (this.isRenewalDue(row.quota_renovacao_em)) {
        await this.aplicarRenovacaoSeVencida(row);
        count += 1;
      }
    }
    return count;
  }

  private async loadWithRenewal(id: string): Promise<Restaurante> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Restaurante não encontrado');
    return this.aplicarRenovacaoSeVencida(row);
  }

  private async seedDefault() {
    let row = await this.repo.findOne({ where: { id: DEFAULT_RESTAURANTE_ID } });
    if (!row) {
      row = this.repo.create({
        id: DEFAULT_RESTAURANTE_ID,
        slug: 'duas-maos-uma-mesa',
        nome: 'Duas Mãos, Uma Mesa',
        ativo: true,
        token_quota_mensal: 500_000,
        tokens_usados_mes: 0,
        quota_ilimitada: false,
        quota_renovacao_em: this.nextRenewalDate(),
      });
      await this.repo.save(row);
    }
  }

  private enrich(r: Restaurante) {
    const usados = r.tokens_usados_mes ?? 0;
    const quota = r.quota_ilimitada
      ? usados * UNLIMITED_DISPLAY_MULT
      : r.token_quota_mensal ?? 0;
    const pct =
      quota > 0 ? Math.min(100, Math.round((usados / quota) * 100)) : 0;
    const custoUsd = usados * 0.00001;
    const custoBrl = custoUsd * USD_TO_BRL;
    return {
      ...r,
      tokens_quota_efetiva: quota,
      percentual_uso: pct,
      custo_estimado_brl: Number(custoBrl.toFixed(2)),
      renovacao_em: r.quota_renovacao_em,
    };
  }

  async findAll() {
    const rows = await this.repo.find({ order: { nome: 'ASC' } });
    const renewed: Restaurante[] = [];
    for (const row of rows) {
      renewed.push(await this.aplicarRenovacaoSeVencida(row));
    }
    return renewed.map((r) => this.enrich(r));
  }

  async findById(id: string) {
    const row = await this.loadWithRenewal(id);
    return this.enrich(row);
  }

  private authBaseUrl(): string {
    return (
      this.config.get<string>('AUTH_SERVICE_URL') ?? 'http://auth-service:3001'
    ).replace(/\/$/, '');
  }

  async findAdminUsuario(restauranteId: string, platformRole: string) {
    const { data } = await firstValueFrom(
      this.http.get(
        `${this.authBaseUrl()}/usuarios/tenant/${restauranteId}/admin`,
        { headers: { 'x-user-role': platformRole } },
      ),
    );
    return data ?? null;
  }

  async findBySlug(slug: string) {
    const row = await this.repo.findOne({ where: { slug, ativo: true } });
    if (!row) throw new NotFoundException('Restaurante não encontrado');
    return {
      id: row.id,
      slug: row.slug,
      nome: row.nome,
      ativo: row.ativo,
    };
  }

  async create(dto: CreateRestauranteDto) {
    const exists = await this.repo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('Slug já em uso');
    const row = this.repo.create({
      id: randomUUID(),
      nome: dto.nome,
      slug: dto.slug,
      ativo: true,
      token_quota_mensal: dto.quota_ilimitada ? null : dto.token_quota_mensal ?? 500_000,
      tokens_usados_mes: 0,
      quota_ilimitada: dto.quota_ilimitada ?? false,
      quota_renovacao_em: this.nextRenewalDate(),
    });
    const saved = await this.repo.save(row);
    await this.empresaService.seedForTenant(saved.id, saved.nome);
    if (dto.clonar_cardapio_modelo !== false) {
      await this.cloneCardapioTemplate(saved.id);
    }
    await this.seedMesasTenant(saved.id, saved.slug);
    return this.enrich(saved);
  }

  private catalogBaseUrl(): string {
    return (
      this.config.get<string>('CATALOG_SERVICE_URL') ??
      'http://catalog-service:3002'
    ).replace(/\/$/, '');
  }

  private async cloneCardapioTemplate(restauranteId: string): Promise<void> {
    try {
      const { data } = await firstValueFrom(
        this.http.post<{ clonados: number }>(
          `${this.catalogBaseUrl()}/internal/produtos/clone-template/${restauranteId}`,
        ),
      );
      this.logger.log(
        `Cardápio clonado para ${restauranteId}: ${data?.clonados ?? 0} produto(s)`,
      );
    } catch (err) {
      this.logger.warn(`Falha ao clonar cardápio: ${err}`);
    }
  }

  private tablesBaseUrl(): string {
    return (
      this.config.get<string>('TABLES_SERVICE_URL') ?? 'http://tables-service:3003'
    ).replace(/\/$/, '');
  }

  private async seedMesasTenant(
    restauranteId: string,
    restauranteSlug: string,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.tablesBaseUrl()}/internal/mesas/seed/${restauranteId}`, {
          restaurante_slug: restauranteSlug,
          quantidade: 5,
        }),
      );
    } catch (err) {
      this.logger.warn(`Falha ao criar mesas do tenant ${restauranteId}: ${err}`);
    }
  }

  async update(id: string, dto: UpdateRestauranteDto) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Restaurante não encontrado');
    if (dto.slug && dto.slug !== row.slug) {
      const clash = await this.repo.findOne({ where: { slug: dto.slug } });
      if (clash) throw new ConflictException('Slug já em uso');
    }
    Object.assign(row, dto);
    if (dto.quota_ilimitada) {
      row.token_quota_mensal = null;
    }
    const saved = await this.repo.save(row);
    return this.enrich(saved);
  }

  async registrarUsoTokens(id: string, tokens: number) {
    let row: Restaurante;
    try {
      row = await this.loadWithRenewal(id);
    } catch {
      return;
    }
    if (!row.quota_ilimitada && row.token_quota_mensal) {
      const limite = row.token_quota_mensal;
      if (row.tokens_usados_mes + tokens > limite) {
        throw new ConflictException('Cota mensal de tokens esgotada');
      }
    }
    row.tokens_usados_mes += tokens;
    await this.repo.save(row);
  }

  async podeUsarTokens(id: string, tokens: number): Promise<boolean> {
    let row: Restaurante;
    try {
      row = await this.loadWithRenewal(id);
    } catch {
      return true;
    }
    if (row.quota_ilimitada) return true;
    if (!row.token_quota_mensal) return true;
    return row.tokens_usados_mes + tokens <= row.token_quota_mensal;
  }
}
