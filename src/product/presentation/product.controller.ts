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
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductCreateDto } from './dtos/product-create.dto';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { ProductCreateService } from '../application/product-create.service';
import { ProductFinderService } from '../application/product-finder.service';
import { ProductUpdateDto } from './dtos/product-update.dto';
import { ProductUpdateService } from '../application/product-update.service';
import { ProductDeleteService } from '../application/product-delete.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

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
    @Req() req: Request,
    @Body() body: ProductCreateDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const headers = req.get('Authorization');
    if (!headers) throw new UnauthorizedException('No authorization header');
    const token = headers.split(' ')[1];
    if (!token) throw new UnauthorizedException('No authorization header');
    const { id } = jwt.verify(token, 'secret') as JwtPayload & { id: number };

    return await this.productCreateService.execute(id, body, image);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const headers = req.get('Authorization');
    if (!headers) throw new UnauthorizedException('No authorization header');
    const token = headers.split(' ')[1];
    if (!token) throw new UnauthorizedException('No authorization header');
    const { id } = jwt.verify(token, 'secret') as JwtPayload & { id: number };

    return await this.productFinderService.findAll(id);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    const headers = req.get('Authorization');
    if (!headers) throw new UnauthorizedException('No authorization header');
    const token = headers.split(' ')[1];
    if (!token) throw new UnauthorizedException('No authorization header');
    const { id } = jwt.verify(token, 'secret') as JwtPayload & { id: number };

    return await this.productFinderService.findBySlug(slug);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async updateProduct(
    @Param('id') productId: number,
    @Body() body: ProductUpdateDto,
    @Req() req: Request,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const headers = req.get('Authorization');
    if (!headers) throw new UnauthorizedException('No authorization header');
    const token = headers.split(' ')[1];
    if (!token) throw new UnauthorizedException('No authorization header');
    const { id } = jwt.verify(token, 'secret') as JwtPayload & { id: number };

    return await this.productUpdateService.execute(id, productId, body, image);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') productId: number, @Req() req: Request) {
    const headers = req.get('Authorization');
    if (!headers) throw new UnauthorizedException('No authorization header');
    const token = headers.split(' ')[1];
    if (!token) throw new UnauthorizedException('No authorization header');
    const { id } = jwt.verify(token, 'secret') as JwtPayload & { id: number };

    return await this.productDeleteService.execute(id, productId);
  }
}
