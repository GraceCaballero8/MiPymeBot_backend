import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductUpdateDto } from '../presentation/dtos/product-update.dto';
import * as sharp from 'sharp';
import { ProductRepository } from '../infrastructure/repository/product.repository';
import { UserFinderService } from 'src/user/application/services/user-finder.service';

@Injectable()
export class ProductUpdateService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly userFinderService: UserFinderService,
  ) {}

  async execute(
    userId: number,
    productId: number,
    data: ProductUpdateDto,
    image?: Express.Multer.File,
  ) {
    const { role } = await this.validateRole(userId);

    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product does not exist');
    }

    if (!product) {
      throw new NotFoundException('Product does not exist');
    }

    if (product.user_id !== userId && role !== 'admin') {
      throw new UnauthorizedException('Unauthorized');
    }

    const productUpdated = await this.productRepository.update(productId, data);

    if (image) {
      await sharp(image.buffer)
        .resize(800)
        .png({ quality: 80 })
        .toFile('public/images/products/' + productUpdated.id + '.png');
    }

    return productUpdated;
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
