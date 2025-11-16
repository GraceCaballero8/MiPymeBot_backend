import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileUpdateDto } from 'src/profile/dto/profile-update.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name_paternal: true,
        last_name_maternal: true,
        dni: true,
        birth_date: true,
        gender: true,
        phone: true,
        address: true,
        profile_image: true,
        company_id: true,
        role: { select: { name: true, alias: true } },
        company: { select: { name: true, ruc: true, sector: true } },
      },
    });
  }

  async updateProfile(userId: number, dto: ProfileUpdateDto) {
    // Convertir birth_date string a Date si existe
    const updateData: any = { ...dto };

    if (dto.birth_date) {
      updateData.birth_date = new Date(dto.birth_date);
    }

    // Remover campos undefined o vacíos para no sobrescribir con null
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name_paternal: true,
        last_name_maternal: true,
        phone: true,
        address: true,
        profile_image: true,
        birth_date: true,
        gender: true,
      },
    });
  }
}
