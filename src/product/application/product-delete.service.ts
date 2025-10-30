import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductRepository } from '../infrastructure/repository/product.repository';
import { UserFinderService } from 'src/user/application/services/user-finder.service';
import * as fs from 'fs';

@Injectable()
export class ProductDeleteService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly userFinderService: UserFinderService,
  ) {}

  async execute(userId: number, id: number) {
    const { role } = await this.validateRole(userId);

    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product does not exist');
    }

    if (product.user_id !== userId && role !== 'admin') {
      throw new UnauthorizedException('Unauthorized');
    }

    // eliminar imagen con sharp
    const path = 'public/images/products/' + product.id + '.png';

    if (!fs.existsSync(path)) return;

    fs.unlink(path, (err) => {
      if (err) console.log(err);
    });

    return await this.productRepository.delete(id);
  }

  async validateRole(userId: number) {
    const user = await this.userFinderService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (user.role.name === 'client') {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      role: user.role.name,
      id: user.id,
    };
  }
}
