import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_RESTAURANTE_ID } from '../common/tenant.constants';
import { Restaurante } from '../restaurante/entities/restaurante.entity';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { Empresa } from './entities/empresa.entity';

const DEFAULT_EMPRESA: Partial<Empresa> = {
  nome: 'Duas Mãos, Uma Mesa',
  missao:
    'Reunir pessoas à mesa com comida feita com carinho, ingredientes frescos e um atendimento que faz cada cliente se sentir em casa.',
  visao:
    'Ser o restaurante onde cada refeição é uma experiência compartilhada — duas mãos servindo, uma mesa unindo.',
  valores: 'Qualidade, respeito, agilidade, sustentabilidade e inovação.',
  horario_funcionamento: {
    segunda_a_sexta: '11:00-22:00',
    sabado: '11:00-23:00',
    domingo: '11:00-21:00',
  },
  endereco: 'Rua das Palmeiras, 456 - Centro, São Paulo - SP',
  telefone: '(11) 3456-7890',
  formas_pagamento: ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix'],
  politica_cancelamento:
    'Pedidos podem ser cancelados antes do envio à cozinha. Após o envio, consulte o garçom.',
  historia:
    'O Duas Mãos, Uma Mesa nasceu da ideia de que a melhor comida é a que se compartilha: cada prato chega à mesa como um convite para estar presente, conversar e saborear juntos.',
  logo_url: null,
  restaurante_id: DEFAULT_RESTAURANTE_ID,
};

@Injectable()
export class EmpresaService implements OnModuleInit {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    @InjectRepository(Restaurante)
    private readonly restauranteRepo: Repository<Restaurante>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.empresaRepo.count();
    if (count === 0) {
      if (process.env.NODE_ENV !== 'production') {
        await this.empresaRepo.save(this.empresaRepo.create(DEFAULT_EMPRESA));
      }
      return;
    }
    await this.migrateLegacyBrandName();
    await this.linkDefaultTenant();
  }

  private async linkDefaultTenant() {
    const rows = await this.empresaRepo.find();
    for (const e of rows) {
      if (!e.restaurante_id) {
        e.restaurante_id = DEFAULT_RESTAURANTE_ID;
        await this.empresaRepo.save(e);
      }
    }
  }

  private async migrateLegacyBrandName(): Promise<void> {
    const legacy = ['Sabor & Cia Lanchonete', 'Sabor & Cia'];
    const rows = await this.empresaRepo.find({ take: 1, order: { created_at: 'ASC' } });
    const empresa = rows[0];
    if (!empresa || !legacy.includes(empresa.nome)) return;
    empresa.nome = DEFAULT_EMPRESA.nome!;
    empresa.missao = DEFAULT_EMPRESA.missao!;
    empresa.visao = DEFAULT_EMPRESA.visao!;
    empresa.historia = DEFAULT_EMPRESA.historia!;
    await this.empresaRepo.save(empresa);
  }

  async seedForTenant(restauranteId: string, nome: string): Promise<Empresa> {
    const existing = await this.empresaRepo.findOne({
      where: { restaurante_id: restauranteId },
    });
    if (existing) return existing;
    return this.empresaRepo.save(
      this.empresaRepo.create({
        nome,
        restaurante_id: restauranteId,
        missao: '',
        visao: '',
        valores: '',
        endereco: '',
        telefone: '',
        logo_url: null,
      }),
    );
  }

  async getEmpresa(restauranteId?: string): Promise<Empresa> {
    const tid = restauranteId || DEFAULT_RESTAURANTE_ID;
    let empresa = await this.empresaRepo.findOne({
      where: { restaurante_id: tid },
    });
    if (!empresa) {
      empresa = await this.empresaRepo.findOne({
        order: { created_at: 'ASC' },
      });
    }
    if (!empresa) {
      const created = await this.empresaRepo.save(
        this.empresaRepo.create(DEFAULT_EMPRESA),
      );
      return this.withSlug(created);
    }
    return this.withSlug(empresa);
  }

  private async withSlug(empresa: Empresa): Promise<Empresa & { restaurante_slug?: string }> {
    const tid = empresa.restaurante_id || DEFAULT_RESTAURANTE_ID;
    const r = await this.restauranteRepo.findOne({ where: { id: tid } });
    return { ...empresa, restaurante_slug: r?.slug ?? 'duas-maos-uma-mesa' };
  }

  async updateEmpresa(dto: UpdateEmpresaDto, restauranteId?: string): Promise<Empresa> {
    const current = await this.getEmpresa(restauranteId);
    Object.assign(current, dto);
    return this.empresaRepo.save(current);
  }

  async updateLogo(logoUrl: string, restauranteId?: string): Promise<Empresa> {
    const current = await this.getEmpresa(restauranteId);
    current.logo_url = logoUrl;
    return this.empresaRepo.save(current);
  }
}
