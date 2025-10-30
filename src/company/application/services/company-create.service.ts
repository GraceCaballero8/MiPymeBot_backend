import { BadRequestException, Injectable } from '@nestjs/common';
import { CompanyCreateDto } from 'src/company/presentation/dto/company-create.dto';
import { CompanyRepository } from '../../infrastucture/prisma/company.repository';
import { PrismaService } from 'src/prisma/prisma.service';



@Injectable()
export class CompanyCreateService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CompanyCreateDto, adminId: number) {
    const existing = await this.prisma.company.findUnique({
      where: { ruc: dto.ruc },
    });

    if (existing) throw new BadRequestException('RUC already registered');

    return this.prisma.company.create({
      data: {
        name: dto.name,
        ruc: dto.ruc,
        admin_id: adminId,
        sector: dto.sector,
        phone: dto.phone,
        address: dto.address,
        description: dto.description,
      },
    });
  }
}