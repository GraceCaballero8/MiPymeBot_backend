import { Controller, UseGuards, Post, Body, Req, Get, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyCreateDto } from './dto/company-create.dto';
import { CompanyCreateService } from '../application/services/company-create.service';
import { CompanyFinderService } from '../application/services/company-finder.service';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyCreateService: CompanyCreateService,
    private readonly companyFinderService: CompanyFinderService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createCompany(@Body() dto: CompanyCreateDto, @Req() req: any) {
    const user = req.user;

    if (user.role !== 'admin') {
      throw new ForbiddenException('Solo Administradores pueden crear Empresas');
    }

    const created = await this.companyCreateService.execute(dto, user.id);
    return {
      message: 'Company created successfully',
      data: created,
    };
  }

  @Get()
  async findAll() {
    return this.companyFinderService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async findMy(@Req() req: any) {
    const user = req.user;
    if (user.role !== 'admin') {
      throw new ForbiddenException('Solo admins pueden ver sus empresas');
    }
    return this.companyFinderService.findByAdminId(user.id);
  }

  
}
