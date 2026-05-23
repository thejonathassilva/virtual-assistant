import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { join, extname } from 'path';
import { Product } from '../products/entities/product.entity';

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly uploadDir: string;
  private readonly publicBasePath: string;

  constructor() {
    this.uploadDir =
      process.env.UPLOAD_DIR || join(process.cwd(), 'uploads', 'produtos');
    this.publicBasePath = (
      process.env.MEDIA_PUBLIC_PATH || '/api/media/produtos'
    ).replace(/\/$/, '');
  }

  onModuleInit() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getPublicUrl(productId: string, ext: string): string {
    return `${this.publicBasePath}/${productId}${ext}`;
  }

  resolveFilePath(filename: string): string {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const full = join(this.uploadDir, safe);
    if (!full.startsWith(this.uploadDir)) {
      throw new BadRequestException('Nome de arquivo inválido');
    }
    if (!existsSync(full)) {
      throw new NotFoundException('Imagem não encontrada');
    }
    return full;
  }

  createReadStreamForFile(filename: string) {
    return createReadStream(this.resolveFilePath(filename));
  }

  validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo de imagem obrigatório');
    }
    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.has(ext) && !ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        'Formato inválido. Use JPG, PNG ou WebP.',
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Imagem deve ter no máximo 5MB');
    }
    return ext || (file.mimetype === 'image/png' ? '.png' : '.jpg');
  }

  saveProductPhoto(product: Product, file: Express.Multer.File): string {
    const ext = this.validateFile(file);
    this.removeProductFiles(product.id);
    const filename = `${product.id}${ext}`;
    const dest = join(this.uploadDir, filename);
    writeFileSync(dest, file.buffer);
    return this.getPublicUrl(product.id, ext);
  }

  removeProductFiles(productId: string) {
    if (!existsSync(this.uploadDir)) return;
    const prefix = productId;
    for (const name of readdirSync(this.uploadDir)) {
      if (name.startsWith(prefix)) {
        try {
          unlinkSync(join(this.uploadDir, name));
        } catch {
          /* ignore */
        }
      }
    }
  }
}
