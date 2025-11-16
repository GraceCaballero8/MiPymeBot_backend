import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CatalogoService } from './catalogo.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('products')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  /**
   * GET /products/groups - Listar grupos de productos
   * IMPORTANTE: Esta ruta DEBE estar ANTES de GET /products/:id
   */
  @Get('groups')
  @Auth()
  getGroups(@GetUser() user: User) {
    if (!user.company_id) {
      throw new Error('Usuario sin compañía asignada');
    }
    return this.catalogoService.getGroups(user.company_id);
  }

  /**
   * GET /products/units - Listar unidades de medida
   * IMPORTANTE: Esta ruta DEBE estar ANTES de GET /products/:id
   */
  @Get('units')
  @Auth()
  getUnits(@GetUser() user: User) {
    if (!user.company_id) {
      throw new Error('Usuario sin compañía asignada');
    }
    return this.catalogoService.getUnits(user.company_id);
  }

  /**
   * GET /products/search - Buscar productos por término
   * IMPORTANTE: Esta ruta DEBE estar ANTES de GET /products/:id
   */
  @Get('search')
  @Auth()
  searchProducts(@GetUser() user: User, @Query('term') term: string) {
    if (!user.company_id) {
      throw new Error('Usuario sin compañía asignada');
    }
    return this.catalogoService.searchByTerm(term, user.company_id);
  }

  /**
   * GET /products - Listar todos los productos de la compañía
   */
  @Get()
  @Auth()
  getAllProducts(@GetUser() user: User) {
    if (!user.company_id) {
      throw new Error('Usuario sin compañía asignada');
    }
    return this.catalogoService.findAll(user.company_id);
  }

  /**
   * POST /products - Crear un nuevo producto
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
   * PATCH /products/:id - Actualizar un producto existente
   */
  @Patch(':id')
  @Auth()
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.catalogoService.update(+id, updateProductDto, user);
  }
}
