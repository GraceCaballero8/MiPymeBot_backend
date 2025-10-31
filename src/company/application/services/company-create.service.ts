import { BadRequestException, Injectable } from '@nestjs/common';
import { CompanyCreateDto } from 'src/company/presentation/dto/company-create.dto';
import { CompanyRepository } from '../../infrastucture/prisma/company.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanyCreateService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CompanyCreateDto, adminId: number) {
    // Solo validar RUC único si se proporciona
    if (dto.ruc) {
      const existing = await this.prisma.company.findUnique({
        where: { ruc: dto.ruc },
      });

      if (existing) throw new BadRequestException('RUC already registered');
    }

    // Crear la empresa
    const company = await this.prisma.company.create({
      data: {
        name: dto.name,
        ruc: dto.ruc || null,
        admin_id: adminId,
        sector: dto.sector,
        phone: dto.phone || null,
        address: dto.address || null,
        description: dto.description || null,
        logo_url: dto.logo_url || null,
      },
    });

    // Actualizar el company_id del admin
    await this.prisma.user.update({
      where: { id: adminId },
      data: { company_id: company.id },
    });

    return company;
  }
}
