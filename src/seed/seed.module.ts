import { Module } from '@nestjs/common';
import { RoleModule } from 'src/role/role.module';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [SeedController],
  imports: [RoleModule, UserModule],
  providers: [SeedService],
})
export class SeedModule {}
