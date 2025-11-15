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
    await this.createSampleProducts();
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
   * Crea grupos de productos y unidades de medida para cada compañía.
   */
  private async createProductGroupsAndUnits() {
    const companies = await this.prisma.company.findMany();

    for (const company of companies) {
      // Crear grupos de productos
      await this.prisma.productGroup.createMany({
        data: [
          { name: 'Producto Terminado', company_id: company.id },
          { name: 'Materia Prima', company_id: company.id },
        ],
      });

      // Crear unidades de medida
      await this.prisma.unitOfMeasure.createMany({
        data: [
          { name: 'Unidades', abbreviation: 'UND', company_id: company.id },
          { name: 'Kilogramos', abbreviation: 'KG', company_id: company.id },
          { name: 'Litros', abbreviation: 'LT', company_id: company.id },
          { name: 'Metros', abbreviation: 'M', company_id: company.id },
        ],
      });
    }
  }

  /**
   * Crea productos de ejemplo para cada compañía.
   */
  private async createSampleProducts() {
    const companies = await this.prisma.company.findMany({
      include: {
        admin: true,
      },
    });

    for (const company of companies) {
      // Obtener los grupos y unidades creados para esta compañía
      const productoTerminado = await this.prisma.productGroup.findFirst({
        where: { name: 'Producto Terminado', company_id: company.id },
      });

      const materiaPrima = await this.prisma.productGroup.findFirst({
        where: { name: 'Materia Prima', company_id: company.id },
      });

      const unidades = await this.prisma.unitOfMeasure.findFirst({
        where: { abbreviation: 'UND', company_id: company.id },
      });

      if (!productoTerminado || !materiaPrima || !unidades) {
        console.warn(
          `No se pudieron crear productos para la compañía ${company.name}`,
        );
        continue;
      }

      // Crear productos de ejemplo
      await this.prisma.product.createMany({
        data: [
          {
            sku: 'PT0001',
            name: 'POLO CUELLO CAMISA',
            slug: 'polo-cuello-camisa-pt0001',
            price: 35.0,
            min_stock: 10,
            unit_id: unidades.id,
            group_id: productoTerminado.id,
            user_id: company.admin_id,
            company_id: company.id,
          },
          {
            sku: 'PT0002',
            name: 'POLO BASICO TALLA M',
            slug: 'polo-basico-talla-m-pt0002',
            price: 25.5,
            min_stock: 50,
            unit_id: unidades.id,
            group_id: productoTerminado.id,
            user_id: company.admin_id,
            company_id: company.id,
          },
          {
            sku: 'MP0002',
            name: 'HILO COLOR BLANCO',
            slug: 'hilo-color-blanco-mp0002',
            price: 15.0,
            min_stock: 10,
            unit_id: unidades.id,
            group_id: materiaPrima.id,
            user_id: company.admin_id,
            company_id: company.id,
          },
        ],
      });

      // Crear un movimiento de ingreso inicial para el producto PT0001
      const pt0001 = await this.prisma.product.findFirst({
        where: { sku: 'PT0001', company_id: company.id },
      });

      if (pt0001) {
        await this.prisma.inventoryMovement.create({
          data: {
            product_id: pt0001.id,
            type: 'INGRESO',
            quantity: 10,
            movement_date: new Date('2025-01-15'),
            observations: 'Stock inicial',
            user_id: company.admin_id,
            company_id: company.id,
          },
        });
      }
    }
  }
}
