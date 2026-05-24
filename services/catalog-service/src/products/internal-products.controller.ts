import { Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('internal')
@Controller('internal/produtos')
export class InternalProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post('clone-template/:restauranteId')
  @ApiOperation({
    summary: 'Clonar cardápio do tenant modelo para um novo restaurante',
  })
  cloneTemplate(@Param('restauranteId') restauranteId: string) {
    return this.products.cloneFromTemplate(restauranteId);
  }
}
