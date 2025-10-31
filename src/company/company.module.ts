import { Module } from '@nestjs/common';
import { CompanyUpdateService } from './application/services/company-update.service';
import { CompanyController } from './presentation/company.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CompanyFinderService } from './application/services/company-finder.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CompanyController],
  providers: [CompanyUpdateService, CompanyFinderService],
  exports: [],
})
export class CompanyModule {}
