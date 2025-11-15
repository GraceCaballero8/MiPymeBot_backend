import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class CatalogoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo producto en el catálogo de la compañía del usuario.
   * Valida que el SKU sea único dentro de la compañía.
   */
  async create(createProductDto: CreateProductDto, user: User) {
    const { sku, name, unit_id, group_id, min_stock, price } = createProductDto;

    // Validar que el SKU no exista ya en la compañía
    const existingProduct = await this.prisma.product.findUnique({
      where: {
        sku_company_id: {
          sku,
          company_id: user.company_id,
        },
      },
    });

    if (existingProduct) {
      throw new BadRequestException(`El SKU "${sku}" ya existe en tu catálogo`);
    }

    // Validar que la unidad de medida exista y pertenezca a la compañía
    const unit = await this.prisma.unitOfMeasure.findFirst({
      where: {
        id: unit_id,
        company_id: user.company_id,
      },
    });

    if (!unit) {
      throw new NotFoundException(
        `La unidad de medida con ID ${unit_id} no existe`,
      );
    }

    // Validar que el grupo exista y pertenezca a la compañía
    const group = await this.prisma.productGroup.findFirst({
      where: {
        id: group_id,
        company_id: user.company_id,
      },
    });

    if (!group) {
      throw new NotFoundException(`El grupo con ID ${group_id} no existe`);
    }

    // Generar slug a partir del nombre
    const slug = this.generateSlug(name, sku);

    // Crear el producto
    return this.prisma.product.create({
      data: {
        sku,
        name,
        slug,
        min_stock,
        price,
        unit_id,
        group_id,
        user_id: user.id,
        company_id: user.company_id,
      },
      include: {
        unit: true,
        group: true,
      },
    });
  }

  /**
   * Busca productos por SKU o nombre dentro de la compañía del usuario.
   * Usado para el autocompletado en "Registro de Movimientos".
   */
  async searchByTerm(term: string, company_id: number) {
    if (!term || term.trim().length === 0) {
      return [];
    }

    const products = await this.prisma.product.findMany({
      where: {
        company_id,
        OR: [
          { sku: { contains: term, mode: 'insensitive' } },
          { name: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        sku: true,
        name: true,
        unit: {
          select: {
            abbreviation: true,
          },
        },
      },
      take: 10, // Limitar a 10 resultados
    });

    return products;
  }

  /**
   * Genera un slug único a partir del nombre y SKU del producto.
   */
  private generateSlug(name: string, sku: string): string {
    const nameSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio/fin

    return `${nameSlug}-${sku.toLowerCase()}`;
  }
}
