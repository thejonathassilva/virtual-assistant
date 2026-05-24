import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('produtos')
@Controller('produtos')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Headers('x-restaurante-id') restauranteId?: string) {
    return this.productsService.findAll(restauranteId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('x-restaurante-id') restauranteId?: string,
  ) {
    return this.productsService.findById(id, restauranteId);
  }

  @Post()
  create(
    @Headers('x-restaurante-id') restauranteId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(dto, restauranteId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Headers('x-restaurante-id') restauranteId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto, restauranteId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-restaurante-id') restauranteId?: string,
  ) {
    return this.productsService.remove(id, restauranteId);
  }

  @Post(':id/foto')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { foto: { type: 'string', format: 'binary' } },
    },
  })
  uploadFoto(
    @Param('id') id: string,
    @Headers('x-restaurante-id') restauranteId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.uploadFoto(id, file, restauranteId);
  }
}
