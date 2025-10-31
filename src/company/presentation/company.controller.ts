import {
  Controller,
  Post,
  Body,
  Get,
  ForbiddenException,
} from '@nestjs/common';

import { CompanyCreateDto } from './dto/company-create.dto';
import { CompanyCreateService } from '../application/services/company-create.service';
import { CompanyFinderService } from '../application/services/company-finder.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Auth(ValidRoles.ADMIN)
@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyCreateService: CompanyCreateService,
    private readonly companyFinderService: CompanyFinderService,
  ) {}

  @Auth(ValidRoles.ADMIN)
  @Post('create')
  async createCompany(@Body() dto: CompanyCreateDto, @GetUser() user: any) {
    if (user.role?.name !== 'admin') {
      throw new ForbiddenException(
        'Solo Administradores pueden crear Empresas',
      );
    }

    const created = await this.companyCreateService.execute(dto, user.id);
    return {
      message: 'Company created successfully',
      data: created,
    };
  }

  @Auth(ValidRoles.ADMIN)
  @Get()
  async findAll() {
    return this.companyFinderService.findAll();
  }

  @Auth(ValidRoles.ADMIN)
  @Get('my')
  async findMy(@GetUser() user: any) {
    if (user.role?.name !== 'admin') {
      throw new ForbiddenException('Solo admins pueden ver sus empresas');
    }
    return this.companyFinderService.findByAdminId(user.id);
  }
}
