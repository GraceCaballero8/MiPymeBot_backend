import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyCreateDto } from 'src/company/presentation/dto/company-create.dto';
import { Company } from '@prisma/client';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CompanyCreateDto & { admin_id: number }) {
    return this.prisma.company.create({ data });
  }

  async findByRuc(ruc: string) {
    return this.prisma.company.findUnique({ where: { ruc } });
  }

  async findByAdminId(adminId: number) {
    return this.prisma.company.findMany({
      where: { admin_id: adminId },
      include: { sellers: true, products: true },
    });
  }

  async findAll(): Promise<Company[]> {
    return this.prisma.company.findMany();
  }
}