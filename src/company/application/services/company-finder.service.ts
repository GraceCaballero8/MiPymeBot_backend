import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanyFinderService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany({
      include: {
        admin: {
          select: {
            id: true,
            first_name: true,
            last_name_paternal: true,
            email: true,
          },
        },
      },
    });
  }

  async findByAdminId(adminId: number) {
    return this.prisma.company.findMany({
      where: { admin_id: adminId },
      include: {
        admin: {
          select: {
            id: true,
            first_name: true,
            last_name_paternal: true,
            email: true,
          },
        },
      },
    });
  }
}
