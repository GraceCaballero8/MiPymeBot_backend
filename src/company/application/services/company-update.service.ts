import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyUpdateDto } from 'src/company/presentation/dto/company-update.dto';

@Injectable()
export class CompanyUpdateService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(companyId: number, dto: CompanyUpdateDto, adminId: number) {
    // Verificar que la empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Verificar que el admin es dueño de la empresa
    if (company.admin_id !== adminId) {
      throw new ForbiddenException('You can only update your own company');
    }

    // Limpiar campos vacíos
    const updateData: any = { ...dto };
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    // Actualizar
    return this.prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });
  }
}
