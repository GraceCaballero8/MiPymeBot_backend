import {
  Controller,
  Body,
  Get,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { CompanyUpdateDto } from './dto/company-update.dto';
import { CompanyUpdateService } from '../application/services/company-update.service';
import { CompanyFinderService } from '../application/services/company-finder.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyUpdateService: CompanyUpdateService,
    private readonly companyFinderService: CompanyFinderService,
  ) {}

  // La empresa se crea automáticamente al registrarse como admin
  // Ya no es necesario el endpoint POST para crear empresa manualmente

  // Actualizar empresa (PATCH /api/company/:id)
  @Auth() // Tanto admin como vendedor pueden actualizar su empresa
  @Patch(':id')
  async updateCompany(
    @Param('id', ParseIntPipe) companyId: number,
    @Body() dto: CompanyUpdateDto,
    @GetUser() user: any,
  ) {
    return await this.companyUpdateService.execute(companyId, dto, user.id);
  }

  // Obtener todas las empresas (GET /api/company) - SOLO ADMIN
  @Auth(ValidRoles.ADMIN)
  @Get()
  async findAll() {
    return this.companyFinderService.findAll();
  }

  // Obtener mi empresa (GET /api/company/my) - Admin y vendedor
  @Auth()
  @Get('my')
  async findMy(@GetUser() user: any) {
    // Si el usuario tiene company_id, buscar por ese ID
    if (user.company_id) {
      return this.companyFinderService.findById(user.company_id);
    }

    // Si es admin sin company_id, buscar por admin_id
    const companies = await this.companyFinderService.findByAdminId(user.id);

    // Si tiene empresa, devolver la primera (solo puede tener una)
    if (companies && companies.length > 0) {
      return companies[0];
    }

    // Si no tiene empresa, devolver null
    return null;
  }
}
