import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserFinderService } from './application/services/user-finder.service';
import { UserCreateService } from './application/services/user-create.service';
import { UserUpdateService } from './application/services/user-update.service';
import { UserDeleteService } from './application/services/user-delete.service';
import { UserRepository } from './infrastructure/user.repository';
import { UserController } from './presentation/user.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [
    PrismaService,
    UserFinderService,
    UserCreateService,
    UserUpdateService,
    UserDeleteService,
    UserRepository,
  ],
  exports: [UserFinderService, UserCreateService, UserRepository],
})
export class UserModule {}
