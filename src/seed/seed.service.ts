import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { seedData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}
  async execute() {
    await this.deleteDatabase();
    await this.createRoles();
    await this.createUsers();
    return 'Seed executed successfully';
  }

  private async createRoles() {
    const roles = seedData.roles;

    await this.prisma.role.createMany({
      data: roles,
    });
  }

  private async createUsers() {
    const users = seedData.users;

    await this.prisma.user.createMany({
      data: users,
    });

    return;
  }

  private async deleteDatabase() {
    // Borramos en orden inverso para evitar conflictos de Foreign Key
    // 1. Borramos usuarios (que dependen de roles)
    await this.prisma.user.deleteMany({});
    // 2. Borramos roles
    await this.prisma.role.deleteMany({});
    return;
  }
}
