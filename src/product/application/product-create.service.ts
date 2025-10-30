import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as sharp from 'sharp';
import { ProductCreateDto } from '../presentation/dtos/product-create.dto';
import { ProductRepository } from '../infrastructure/repository/product.repository';
import { UserRepository } from 'src/user/infrastructure/user.repository';
import { UserFinderService } from 'src/user/application/services/user-finder.service';

@Injectable()
export class ProductCreateService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly userFinderService: UserFinderService,
  ) {}

  async execute(
    userId: number,
    data: ProductCreateDto,
    image?: Express.Multer.File,
  ) {
    await this.validateRole(userId);

    const product = await this.productRepository.findBySlug(
      data.name.toLowerCase().replace(/\s/g, '-'),
    );

    if (product) {
      throw new BadRequestException('Product already exists');
    }

    const productCreated = await this.productRepository.create({
      name: data.name,
      price: data.price,
      stock: data.stock,
      slug: data.name.toLowerCase().replace(/\s/g, '-'),
      user_id: userId,
      company_id: data.company_id,
    });

    if (image) {
      await sharp(image.buffer)
        .resize(800)
        .png({ quality: 80 })
        .toFile('public/images/products/' + productCreated.id + '.png');
    }

    return productCreated;
  }

  async validateRole(userId: number) {
    const user = await this.userFinderService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (user.role.name === 'client') {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
