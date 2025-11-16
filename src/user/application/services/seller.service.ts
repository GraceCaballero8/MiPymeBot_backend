import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSellerDto } from '../../presentation/dto/create-seller.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaService) {}

  async createSeller(adminId: number, createSellerDto: CreateSellerDto) {
    // Verificar que el admin existe y tiene una empresa
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      include: { role: true },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (!admin.company_id) {
      throw new ConflictException(
        'You must have a company before adding sellers.',
      );
    }

    // Verificar que el email no esté en uso
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createSellerDto.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Verificar que el DNI no esté en uso
    const existingDni = await this.prisma.user.findUnique({
      where: { dni: createSellerDto.dni },
    });

    if (existingDni) {
      throw new ConflictException('DNI already in use');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createSellerDto.password, 10);

    // Crear el vendedor (role_id = 2 siempre para vendedor)
    const seller = await this.prisma.user.create({
      data: {
        email: createSellerDto.email.toLowerCase().trim(),
        password: hashedPassword,
        first_name: createSellerDto.first_name,
        last_name_paternal: createSellerDto.last_name_paternal,
        last_name_maternal: createSellerDto.last_name_maternal,
        dni: createSellerDto.dni,
        birth_date: new Date(createSellerDto.birth_date),
        gender: createSellerDto.gender,
        phone: createSellerDto.phone,
        address: createSellerDto.address,
        profile_image: createSellerDto.profile_image,
        role_id: 2, // Rol de vendedor (hardcoded)
        company_id: admin.company_id,
        status: 'ACTIVE',
      },
      include: {
        role: true,
        company: true,
      },
    });

    // Devolver el vendedor sin la contraseña
    const { password, ...sellerWithoutPassword } = seller;

    return sellerWithoutPassword;
  }
}
