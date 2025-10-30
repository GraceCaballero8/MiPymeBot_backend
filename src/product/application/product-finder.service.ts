import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ProductRepository } from '../infrastructure/repository/product.repository';
import { UserFinderService } from 'src/user/application/services/user-finder.service';

@Injectable()
export class ProductFinderService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly userFinderService: UserFinderService,
  ) {}

  async findAll(userId: number) {
    const { id, role } = await this.validateRole(userId);

    if (role === 'company') {
      return await this.productRepository.findAllByUserId(id);
    }

    return await this.productRepository.findAll();
  }

  async findById(id: number) {
    return await this.productRepository.findById(id);
  }

  async findBySlug(slug: string) {
    return await this.productRepository.findBySlug(slug);
  }

  async validateRole(userId: number) {
    const user = await this.userFinderService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      role: user.role.name,
      id: user.id,
    };
  }
}
