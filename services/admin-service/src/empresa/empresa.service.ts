import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
};

@Injectable()
export class EmpresaService implements OnModuleInit {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
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
  }

  /** Atualiza seed antigo (Sabor & Cia) após rename da marca. */
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

  async getEmpresa(): Promise<Empresa> {
    const empresa = await this.empresaRepo.find({ take: 1, order: { created_at: 'ASC' } });
    if (!empresa[0]) {
      return this.empresaRepo.save(this.empresaRepo.create(DEFAULT_EMPRESA));
    }
    return empresa[0];
  }

  async updateEmpresa(dto: UpdateEmpresaDto): Promise<Empresa> {
    const current = await this.getEmpresa();
    Object.assign(current, dto);
    return this.empresaRepo.save(current);
  }

  async updateLogo(logoUrl: string): Promise<Empresa> {
    const current = await this.getEmpresa();
    current.logo_url = logoUrl;
    return this.empresaRepo.save(current);
  }
}
