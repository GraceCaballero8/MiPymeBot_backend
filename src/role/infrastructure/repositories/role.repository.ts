import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IRoleCreate } from 'src/role/domain/interfaces/role-create.interface';
import { IRoleUpdate } from 'src/role/domain/interfaces/role-update.interface';

@Injectable()
export class RoleRepository {
  constructor(private readonly PrismaService: PrismaService) {}

  async findAll() {
    return this.PrismaService.role.findMany();
  }

  async findOne(id: number) {
    return this.PrismaService.role.findUnique({
      where: { id },
    });
  }

  async findById(id: number) {
    return this.PrismaService.role.findUnique({
      where: { id },
    });
  }

  async create(role: IRoleCreate) {
    return this.PrismaService.role.create({
      data: role,
    });
  }

  async update(id: number, role: IRoleUpdate) {
    return this.PrismaService.role.update({
      where: { id },
      data: role,
    });
  }

  async remove(id: number) {
    return this.PrismaService.role.delete({
      where: { id },
    });
  }
}
