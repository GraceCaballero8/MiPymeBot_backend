import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { SeedModule } from './seed/seed.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CompanyModule } from './company/company.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
