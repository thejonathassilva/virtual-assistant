import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaService } from '../media/media.service';
import { RedisService } from '../redis/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DEFAULT_RESTAURANTE_ID, resolveRestauranteId } from '../common/tenant';
import { CategoriaProduto, Product } from './entities/product.entity';

const cacheAllKey = (tid: string) => `cardapio:all:${tid}`;
const cacheCategoriaKey = (tid: string, cat: string) => `cardapio:categoria:${tid}:${cat}`;

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    private readonly redis: RedisService,
    private readonly media: MediaService,
  ) {}

  async onModuleInit() {
    await this.cleanupLegacyPhotoUrls();
    await this.linkDefaultTenant();
    if (process.env.NODE_ENV === 'production') return;
    const count = await this.repo.count();
    if (count === 0) {
      await this.seedProdutos();
    }
  }

  private async linkDefaultTenant() {
    const rows = await this.repo.find();
    for (const p of rows) {
      if (!p.restaurante_id) {
        p.restaurante_id = DEFAULT_RESTAURANTE_ID;
        await this.repo.save(p);
      }
    }
  }

  private async cleanupLegacyPhotoUrls() {
    const legacy = await this.repo
      .createQueryBuilder('p')
      .where(
        "p.foto_url ILIKE '%unsplash%' OR p.foto_url ILIKE '%placeholder%'",
      )
      .getMany();
    if (legacy.length === 0) return;
    for (const product of legacy) {
      product.foto_url = undefined;
      await this.repo.save(product);
    }
    await this.invalidateCardapioCache(DEFAULT_RESTAURANTE_ID);
  }

  private async seedProdutos() {
    const produtos: Partial<Product>[] = [
      {
        nome: 'Batata Frita Crocante',
        descricao: 'Porção generosa de batatas fritas temperadas',
        preco: '18.90',
        categoria: CategoriaProduto.ENTRADAS,
        ingredientes: ['batata', 'óleo', 'sal'],
        alergenos: [],
        tags: ['porcao', 'vegetariano'],
        foto_url: undefined,
        tempo_preparo_minutos: 8,
        ativo: true,
      },
      {
        nome: 'Onion Rings',
        descricao: 'Anéis de cebola empanados e crocantes',
        preco: '22.50',
        categoria: CategoriaProduto.ENTRADAS,
        ingredientes: ['cebola', 'farinha', 'óleo'],
        alergenos: ['gluten'],
        tags: ['porcao', 'frito'],
        foto_url: undefined,
        tempo_preparo_minutos: 10,
        ativo: true,
      },
      {
        nome: 'Nuggets de Frango (8un)',
        descricao: 'Nuggets crocantes com molho barbecue',
        preco: '24.90',
        categoria: CategoriaProduto.ENTRADAS,
        ingredientes: ['frango', 'farinha', 'temperos'],
        alergenos: ['gluten'],
        tags: ['frango', 'kids'],
        tempo_preparo_minutos: 12,
        ativo: true,
      },
      {
        nome: 'X-Burger Clássico',
        descricao: 'Hambúrguer bovino, queijo, alface, tomate e molho especial',
        preco: '28.90',
        categoria: CategoriaProduto.PRATOS_PRINCIPAIS,
        ingredientes: ['pão', 'carne bovina', 'queijo', 'alface', 'tomate'],
        alergenos: ['gluten', 'lactose'],
        tags: ['lanche', 'popular', 'carne'],
        foto_url: undefined,
        tempo_preparo_minutos: 15,
        ativo: true,
      },
      {
        nome: 'X-Bacon Duplo',
        descricao: 'Dois hambúrgueres, bacon crocante, cheddar e cebola caramelizada',
        preco: '36.90',
        categoria: CategoriaProduto.PRATOS_PRINCIPAIS,
        ingredientes: ['pão', 'carne bovina', 'bacon', 'queijo cheddar', 'cebola'],
        alergenos: ['gluten', 'lactose'],
        tags: ['lanche', 'premium', 'carne'],
        tempo_preparo_minutos: 18,
        ativo: true,
      },
      {
        nome: 'X-Salada Light',
        descricao: 'Hambúrguer de frango grelhado com salada fresca',
        preco: '26.90',
        categoria: CategoriaProduto.PRATOS_PRINCIPAIS,
        ingredientes: ['pão integral', 'frango', 'alface', 'tomate', 'cenoura'],
        alergenos: ['gluten'],
        tags: ['lanche', 'frango', 'leve'],
        tempo_preparo_minutos: 14,
        ativo: true,
      },
      {
        nome: 'X-Tudo da Casa',
        descricao: 'O lanche completo: carne, frango, bacon, ovo, presunto e queijo',
        preco: '42.90',
        categoria: CategoriaProduto.PRATOS_PRINCIPAIS,
        ingredientes: ['pão', 'carne', 'frango', 'bacon', 'ovo', 'presunto', 'queijo'],
        alergenos: ['gluten', 'lactose', 'ovo'],
        tags: ['lanche', 'premium', 'combo'],
        tempo_preparo_minutos: 20,
        ativo: true,
      },
      {
        nome: 'Hot Dog Especial',
        descricao: 'Salsicha, purê, batata palha, milho e molhos',
        preco: '19.90',
        categoria: CategoriaProduto.PRATOS_PRINCIPAIS,
        ingredientes: ['pão', 'salsicha', 'purê', 'batata palha', 'milho'],
        alergenos: ['gluten', 'lactose'],
        tags: ['lanche', 'popular'],
        tempo_preparo_minutos: 10,
        ativo: true,
      },
      {
        nome: 'Misto Quente',
        descricao: 'Pão de forma com presunto e queijo gratinado',
        preco: '14.90',
        categoria: CategoriaProduto.PRATOS_PRINCIPAIS,
        ingredientes: ['pão', 'presunto', 'queijo'],
        alergenos: ['gluten', 'lactose'],
        tags: ['lanche', 'rapido'],
        tempo_preparo_minutos: 8,
        ativo: true,
      },
      {
        nome: 'Cachorro-Quente Completo',
        descricao: 'Salsicha artesanal com vinagrete e mostarda',
        preco: '17.90',
        categoria: CategoriaProduto.PRATOS_PRINCIPAIS,
        ingredientes: ['pão', 'salsicha', 'vinagrete', 'mostarda'],
        alergenos: ['gluten'],
        tags: ['lanche'],
        tempo_preparo_minutos: 9,
        ativo: true,
      },
      {
        nome: 'Refrigerante Lata 350ml',
        descricao: 'Coca-Cola, Guaraná ou Sprite',
        preco: '6.90',
        categoria: CategoriaProduto.BEBIDAS,
        ingredientes: ['refrigerante'],
        alergenos: [],
        tags: ['bebida', 'gelada'],
        tempo_preparo_minutos: 1,
        ativo: true,
      },
      {
        nome: 'Suco Natural 500ml',
        descricao: 'Laranja, abacaxi ou maracujá',
        preco: '12.90',
        categoria: CategoriaProduto.BEBIDAS,
        ingredientes: ['fruta', 'água', 'açúcar'],
        alergenos: [],
        tags: ['bebida', 'natural'],
        tempo_preparo_minutos: 5,
        ativo: true,
      },
      {
        nome: 'Milk Shake 400ml',
        descricao: 'Chocolate, morango ou baunilha cremoso',
        preco: '16.90',
        categoria: CategoriaProduto.BEBIDAS,
        ingredientes: ['leite', 'sorvete', 'calda'],
        alergenos: ['lactose'],
        tags: ['bebida', 'doce'],
        tempo_preparo_minutos: 6,
        ativo: true,
      },
      {
        nome: 'Água Mineral 500ml',
        descricao: 'Água mineral sem gás',
        preco: '4.50',
        categoria: CategoriaProduto.BEBIDAS,
        ingredientes: ['água'],
        alergenos: [],
        tags: ['bebida'],
        tempo_preparo_minutos: 1,
        ativo: true,
      },
      {
        nome: 'Chá Gelado 400ml',
        descricao: 'Pêssego ou limão com gelo',
        preco: '9.90',
        categoria: CategoriaProduto.BEBIDAS,
        ingredientes: ['chá', 'açúcar', 'gelo'],
        alergenos: [],
        tags: ['bebida', 'gelada'],
        tempo_preparo_minutos: 3,
        ativo: true,
      },
      {
        nome: 'Brownie com Sorvete',
        descricao: 'Brownie de chocolate quente com bola de sorvete',
        preco: '18.90',
        categoria: CategoriaProduto.SOBREMESAS,
        ingredientes: ['chocolate', 'farinha', 'sorvete'],
        alergenos: ['gluten', 'lactose', 'ovo'],
        tags: ['doce', 'popular'],
        tempo_preparo_minutos: 8,
        ativo: true,
      },
      {
        nome: 'Milk Shake de Ovomaltine',
        descricao: 'Milk shake cremoso com Ovomaltine',
        preco: '19.90',
        categoria: CategoriaProduto.SOBREMESAS,
        ingredientes: ['leite', 'sorvete', 'ovomaltine'],
        alergenos: ['lactose', 'gluten'],
        tags: ['doce', 'premium'],
        tempo_preparo_minutos: 7,
        ativo: true,
      },
      {
        nome: 'Banana Split',
        descricao: 'Banana com três sabores de sorvete e calda',
        preco: '22.90',
        categoria: CategoriaProduto.SOBREMESAS,
        ingredientes: ['banana', 'sorvete', 'calda de chocolate'],
        alergenos: ['lactose'],
        tags: ['doce', 'fruta'],
        tempo_preparo_minutos: 6,
        ativo: true,
      },
      {
        nome: 'Petit Gateau',
        descricao: 'Bolinho de chocolate com centro cremoso e sorvete',
        preco: '24.90',
        categoria: CategoriaProduto.SOBREMESAS,
        ingredientes: ['chocolate', 'farinha', 'sorvete'],
        alergenos: ['gluten', 'lactose', 'ovo'],
        tags: ['doce', 'premium'],
        tempo_preparo_minutos: 12,
        ativo: true,
      },
      {
        nome: 'X-Veggie',
        descricao: 'Hambúrguer de grão-de-bico com legumes grelhados',
        preco: '27.90',
        categoria: CategoriaProduto.PRATOS_PRINCIPAIS,
        ingredientes: ['pão', 'grão-de-bico', 'abobrinha', 'berinjela'],
        alergenos: ['gluten'],
        tags: ['lanche', 'vegetariano'],
        tempo_preparo_minutos: 16,
        ativo: false,
      },
    ];

    for (const p of produtos) {
      await this.repo.save(
        this.repo.create({ ...p, restaurante_id: DEFAULT_RESTAURANTE_ID }),
      );
    }
  }

  private async invalidateCardapioCache(restauranteId?: string) {
    const tid = resolveRestauranteId(restauranteId);
    await this.redis.del(cacheAllKey(tid));
    await this.redis.delByPattern(`cardapio:categoria:${tid}:*`);
  }

  findAll(restauranteId?: string) {
    const tid = resolveRestauranteId(restauranteId);
    return this.repo.find({
      where: { restaurante_id: tid },
      order: { nome: 'ASC' },
    });
  }

  async findById(id: string, restauranteId?: string) {
    const tid = resolveRestauranteId(restauranteId);
    const product = await this.repo.findOne({
      where: { id, restaurante_id: tid },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async create(dto: CreateProductDto, restauranteId?: string) {
    const tid = resolveRestauranteId(restauranteId);
    const exists = await this.repo.findOne({
      where: { nome: dto.nome, restaurante_id: tid },
    });
    if (exists) {
      throw new ConflictException('Já existe um produto com este nome');
    }
    const product = this.repo.create({
      ...dto,
      restaurante_id: tid,
      preco: dto.preco.toFixed(2),
      ingredientes: dto.ingredientes ?? [],
      alergenos: dto.alergenos ?? [],
      tags: dto.tags ?? [],
      ativo: dto.ativo ?? true,
      tempo_preparo_minutos: dto.tempo_preparo_minutos ?? 0,
    });
    const saved = await this.repo.save(product);
    await this.invalidateCardapioCache(tid);
    return saved;
  }

  async update(id: string, dto: UpdateProductDto, restauranteId?: string) {
    const product = await this.findById(id, restauranteId);
    const tid = product.restaurante_id;
    if (dto.nome && dto.nome !== product.nome) {
      const exists = await this.repo.findOne({
        where: { nome: dto.nome, restaurante_id: tid },
      });
      if (exists) {
        throw new ConflictException('Já existe um produto com este nome');
      }
    }
    if (dto.preco !== undefined) {
      product.preco = dto.preco.toFixed(2);
    }
    const { preco: _preco, ...rest } = dto;
    Object.assign(product, rest);
    const saved = await this.repo.save(product);
    await this.invalidateCardapioCache(tid);
    return saved;
  }

  async remove(id: string, restauranteId?: string) {
    const product = await this.findById(id, restauranteId);
    this.media.removeProductFiles(id);
    await this.repo.remove(product);
    await this.invalidateCardapioCache(product.restaurante_id);
    return { deleted: true, id };
  }

  async uploadFoto(id: string, file: Express.Multer.File, restauranteId?: string) {
    const product = await this.findById(id, restauranteId);
    product.foto_url = this.media.saveProductPhoto(product, file);
    const saved = await this.repo.save(product);
    await this.invalidateCardapioCache(product.restaurante_id);
    return saved;
  }

  findActive(restauranteId?: string) {
    const tid = resolveRestauranteId(restauranteId);
    return this.repo.find({
      where: { ativo: true, restaurante_id: tid },
      order: { categoria: 'ASC', nome: 'ASC' },
    });
  }

  findActiveByCategoria(categoria: CategoriaProduto, restauranteId?: string) {
    const tid = resolveRestauranteId(restauranteId);
    return this.repo.find({
      where: { ativo: true, categoria, restaurante_id: tid },
      order: { nome: 'ASC' },
    });
  }
}
