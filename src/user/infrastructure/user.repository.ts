import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUserCreate } from '../domain/interfaces/user-create.interface';
import { IUserUpdate } from '../domain/interfaces/user-update.interface';

@Injectable()
export class UserRepository {
  constructor(private readonly PrismaService: PrismaService) {}

  async findAll() {
    return this.PrismaService.user.findMany({
      omit: {
        password: true,
      },
      include: {
        role: true,
      },
    });
  }

  async findAllWithoudAdmin() {
    return this.PrismaService.user.findMany({
      where: {
        role: {
          isNot: {
            name: 'admin',
          },
        },
      },
      include: {
        role: true,
      },
      omit: {
        password: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.PrismaService.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  async findById(id: number) {
    return this.PrismaService.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });
  }

  async findByDni(dni: string) {
    return this.PrismaService.user.findUnique({
      where: { dni },
    });
  }

  // Buscar vendedores por company_id
  async findSellersByCompanyId(companyId: number) {
    return this.PrismaService.user.findMany({
      where: {
        company_id: companyId,
        role: {
          name: {
            in: ['vendor', 'seller'], // Roles de vendedores
          },
        },
      },
      include: {
        role: true,
        company: {
          select: {
            id: true,
            name: true,
            ruc: true,
          },
        },
      },
      omit: {
        password: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async create(user: IUserCreate) {
    return this.PrismaService.user.create({
      data: user,
    });
  }

  async update(id: number, user: IUserUpdate) {
    return this.PrismaService.user.update({
      where: { id },
      data: user,
    });
  }

  async delete(id: number) {
    return this.PrismaService.user.delete({
      where: { id },
    });
  }
}
