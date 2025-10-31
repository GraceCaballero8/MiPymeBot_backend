import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductCreateService } from '../application/product-create.service';
import { ProductFinderService } from '../application/product-finder.service';
import { ProductUpdateDto } from './dtos/product-update.dto';
import { ProductUpdateService } from '../application/product-update.service';
import { ProductDeleteService } from '../application/product-delete.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Auth()
@Controller('products')
export class ProductController {
  constructor(
    private readonly productCreateService: ProductCreateService,
    private readonly productFinderService: ProductFinderService,
    private readonly productUpdateService: ProductUpdateService,
    private readonly productDeleteService: ProductDeleteService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async createProduct(
    @GetUser() user: User,
    @Body() body: ProductCreateDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return await this.productCreateService.execute(user.id, body, image);
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.productFinderService.findAll(user.id);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string, @GetUser() user: User) {
    return await this.productFinderService.findBySlug(slug);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async updateProduct(
    @Param('id') productId: number,
    @Body() body: ProductUpdateDto,
    @GetUser() user: User,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return await this.productUpdateService.execute(
      user.id,
      productId,
      body,
      image,
    );
  }

  @Delete(':id')
  async deleteProduct(@Param('id') productId: number, @GetUser() user: User) {
    return await this.productDeleteService.execute(user.id, productId);
  }
}
