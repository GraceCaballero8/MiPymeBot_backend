import { Module } from '@nestjs/common';
import { CompanyCreateService } from './application/services/company-create.service';
import { CompanyController } from './presentation/company.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyRepository } from './infrastucture/prisma/company.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { CompanyFinderService } from './application/services/company-finder.service';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyController],
  providers: [CompanyCreateService,CompanyFinderService, CompanyRepository],
  exports:    [CompanyCreateService],
})
export class CompanyModule {}
