import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IProductCreate } from 'src/product/domain/product-create.interface';
import { IProductUpdate } from 'src/product/domain/product-update.interface';

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.product.findMany({
      include: {
        user: {
          omit: {
            password: true,
          },
        },
      },
    });
  }

  async findAllByUserId(userId: number) {
    return await this.prismaService.product.findMany({
      where: { user_id: userId },
    });
  }

  async findById(id: number) {
    return await this.prismaService.product.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return await this.prismaService.product.findUnique({
      where: { slug },
    });
  }

  async create(product: IProductCreate) {
    return await this.prismaService.product.create({
      data: {
        ...product,
        company_id: product.company_id, 
      },
    });
  }

  async update(id: number, product: IProductUpdate) {
    return await this.prismaService.product.update({
      where: { id },
      data: product,
    });
  }

  async delete(id: number) {
    return await this.prismaService.product.delete({
      where: { id },
    });
  }
}
