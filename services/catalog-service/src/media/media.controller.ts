import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { extname } from 'path';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('produtos/:filename')
  @ApiOperation({ summary: 'Servir foto do produto (público)' })
  @Header('Cache-Control', 'public, max-age=86400')
  serveProductImage(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const filePath = this.mediaService.resolveFilePath(filename);
      const ext = extname(filename).toLowerCase();
      const mime =
        ext === '.png'
          ? 'image/png'
          : ext === '.webp'
            ? 'image/webp'
            : 'image/jpeg';
      res.set('Content-Type', mime);
      const stream = this.mediaService.createReadStreamForFile(filename);
      return new StreamableFile(stream);
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new NotFoundException('Imagem não encontrada');
    }
  }
}
