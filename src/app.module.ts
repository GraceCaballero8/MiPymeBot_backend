import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { SeedModule } from './seed/seed.module';
import { RoleModule } from './role/role.module';
import { ProductModule } from './product/product.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CompanyModule } from './company/company.module';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      // Exclude API routes so the static middleware doesn't intercept them.
      serveRoot: '/public',
    }),
    UserModule,
    PrismaModule,
    SeedModule,
    RoleModule,
    AuthModule,
    ProductModule,
    CompanyModule,
    ProfileModule,
  ],
})
export class AppModule {}
