import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductRepository } from './infrastructure/repository/product.repository';
import { ProductCreateService } from './application/product-create.service';
import { UserModule } from 'src/user/user.module';
import { ProductController } from './presentation/product.controller';
import { ProductFinderService } from './application/product-finder.service';
import { ProductUpdateService } from './application/product-update.service';
import { ProductDeleteService } from './application/product-delete.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule],
  controllers: [ProductController],
  providers: [
    ProductRepository,
    ProductCreateService,
    ProductFinderService,
    ProductUpdateService,
    ProductDeleteService,
  ],
  exports: [ProductCreateService],
})
export class ProductModule {}
