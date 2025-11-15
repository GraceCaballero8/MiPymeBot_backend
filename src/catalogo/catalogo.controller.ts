import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { User } from '@prisma/client';
import { CatalogoService } from './catalogo.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('products')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  /**
   * ENDPOINT 1: Para tu pantalla "Gestión de Productos"
   * Crea un nuevo producto maestro en el catálogo.
   *
   * POST /products
   * Body: { sku, name, unit_id, group_id, min_stock, price? }
   */
  @Post()
  @Auth()
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User,
  ) {
    return this.catalogoService.create(createProductDto, user);
  }

  /**
   * ENDPOINT (Bonus): Para el autocompletar de "Registro de Movimientos"
   * Busca productos por SKU o nombre para el dropdown.
   *
   * GET /products/search?term=PT
   */
  @Get('search')
  @Auth()
  searchProducts(@GetUser() user: User, @Query('term') term: string) {
    return this.catalogoService.searchByTerm(term, user.company_id);
  }
}
