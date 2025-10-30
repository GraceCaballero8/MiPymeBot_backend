import { Module } from '@nestjs/common';
import { RoleCreateService } from './application/services/role-create.service';
import { RoleRepository } from './infrastructure/repositories/role.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RoleFinderService } from './application/services/role-finder.service';
import { RoleController } from './presentation/role.controlle';

@Module({
  controllers: [RoleController],
  imports: [PrismaModule],
  providers: [RoleCreateService, RoleRepository, RoleFinderService],
  exports: [RoleCreateService, RoleFinderService, RoleRepository],
})
export class RoleModule {}
