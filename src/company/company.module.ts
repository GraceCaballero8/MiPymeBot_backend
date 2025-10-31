import { Module } from '@nestjs/common';
import { CompanyCreateService } from './application/services/company-create.service';
import { CompanyController } from './presentation/company.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyRepository } from './infrastucture/prisma/company.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { CompanyFinderService } from './application/services/company-finder.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CompanyController],
  providers: [CompanyCreateService, CompanyFinderService, CompanyRepository],
  exports: [CompanyCreateService],
})
export class CompanyModule {}
