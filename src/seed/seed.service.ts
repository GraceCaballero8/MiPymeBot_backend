import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { seedData } from './data/seed-data';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    await this.deleteDatabase();
    await this.createRoles();
    await this.createUsersWithCompanies();
    await this.createProductGroupsAndUnits();
    return 'Seed executed successfully';
  }

  private async createRoles() {
    const roles = seedData.roles;

    await this.prisma.role.createMany({
      data: roles,
    });
  }

  private async createUsersWithCompanies() {
    const createdAdmins: { id: number; companyId: number }[] = [];

    for (const user of seedData.users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Si es admin (role_id = 1), crear con compañía
      if (user.role_id === 1) {
        await this.prisma.$transaction(async (tx) => {
          // Crear usuario admin
          const createdUser = await tx.user.create({
            data: {
              email: user.email,
              password: hashedPassword,
              first_name: user.first_name,
              last_name_paternal: user.last_name_paternal,
              last_name_maternal: user.last_name_maternal,
              dni: user.dni,
              dni_verifier: user.dni_verifier,
              birth_date: user.birth_date,
              role_id: user.role_id,
              gender: user.gender,
              status: user.status || 'ACTIVE',
            },
          });

          // Crear compañía para el admin
          const defaultCompanyName = `Empresa de ${createdUser.first_name} ${createdUser.last_name_paternal}`;

          const company = await tx.company.create({
            data: {
              name: defaultCompanyName,
              admin_id: createdUser.id,
              sector: 'General',
              description: 'Compañía creada automáticamente en el seed',
            },
          });

          // Actualizar el usuario con la compañía
          await tx.user.update({
            where: { id: createdUser.id },
            data: { company_id: company.id },
          });

          // Guardar info del admin para asociar vendedores después
          createdAdmins.push({ id: createdUser.id, companyId: company.id });
        });
      }
      // Si es vendedor (role_id = 2), crear y asociar a compañía del admin
      else if (user.role_id === 2) {
        const companyIndex = user.company_index ?? 0;
        const adminInfo = createdAdmins[companyIndex];

        if (!adminInfo) {
          console.warn(
            `Vendedor ${user.email} no pudo ser creado: no existe admin en índice ${companyIndex}`,
          );
          continue;
        }

        await this.prisma.user.create({
          data: {
            email: user.email,
            password: hashedPassword,
            first_name: user.first_name,
            last_name_paternal: user.last_name_paternal,
            last_name_maternal: user.last_name_maternal,
            dni: user.dni,
            dni_verifier: user.dni_verifier,
            birth_date: user.birth_date,
            role_id: user.role_id,
            gender: user.gender,
            status: user.status || 'ACTIVE',
            company_id: adminInfo.companyId, // Asociar a la compañía del admin
          },
        });
      }
    }
  }

  private async deleteDatabase() {
    // Borramos en orden inverso para evitar conflictos de Foreign Key

    // 1. Borrar movimientos de inventario
    await this.prisma.inventoryMovement.deleteMany({});

    // 2. Borrar productos
    await this.prisma.product.deleteMany({});

    // 3. Borrar grupos y unidades
    await this.prisma.productGroup.deleteMany({});
    await this.prisma.unitOfMeasure.deleteMany({});

    // 4. Borrar compañías
    await this.prisma.company.deleteMany({});

    // 5. Borrar usuarios (que dependen de roles)
    await this.prisma.user.deleteMany({});

    // 6. Borrar roles
    await this.prisma.role.deleteMany({});
  }

  /**
   * Crea grupos de productos y unidades de medida (catálogos globales).
   */
  private async createProductGroupsAndUnits() {
    // Crear grupos de productos desde seedData (una sola vez, globales)
    const groupsData = seedData.productGroups.map((group) => ({
      name: group.name,
    }));

    await this.prisma.productGroup.createMany({
      data: groupsData,
      skipDuplicates: true, // Evitar duplicados si ya existen
    });

    // Crear unidades de medida desde seedData (una sola vez, globales)
    const unitsData = seedData.unitsOfMeasure.map((unit) => ({
      name: unit.name,
      abbreviation: unit.abbreviation,
    }));

    await this.prisma.unitOfMeasure.createMany({
      data: unitsData,
      skipDuplicates: true, // Evitar duplicados si ya existen
    });
  }
}
