import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class CatalogoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo producto en el catálogo de la compañía del usuario.
   * Valida que el SKU sea único dentro de la compañía.
   */
  async create(createProductDto: CreateProductDto, user: User) {
    const { sku, name, unit_id, group_id, min_stock, price } = createProductDto;

    if (!user.company_id) {
      throw new BadRequestException('Usuario sin compañía asignada');
    }

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

    // Validar que la unidad de medida exista (catálogo global)
    const unit = await this.prisma.unitOfMeasure.findUnique({
      where: { id: unit_id },
    });

    if (!unit) {
      throw new NotFoundException(
        `La unidad de medida con ID ${unit_id} no existe`,
      );
    }

    // Validar que el grupo exista (catálogo global)
    const group = await this.prisma.productGroup.findUnique({
      where: { id: group_id },
    });

    if (!group) {
      throw new NotFoundException(`El grupo con ID ${group_id} no existe`);
    }

    // 1. Crear el producto SIN slug (o con slug temporal null)
    const createdProduct = await this.prisma.product.create({
      data: {
        sku,
        name,
        slug: null, // Se actualizará después con el id
        min_stock,
        price,
        unit_id,
        group_id,
        user_id: user.id,
        company_id: user.company_id,
      },
    });

    // 2. Generar slug único usando el id del producto recién creado
    const slug = this.generateSlug(name, createdProduct.id);

    // 3. Actualizar el producto con el slug definitivo
    return this.prisma.product.update({
      where: { id: createdProduct.id },
      data: { slug },
      include: {
        unit: true,
        group: true,
      },
    });
  }

  /**
   * Obtiene todos los productos de una compañía.
   */
  async findAll(company_id: number) {
    return this.prisma.product.findMany({
      where: { company_id },
      include: {
        unit: true,
        group: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Obtiene todos los grupos de productos (catálogo global).
   */
  async getGroups() {
    return this.prisma.productGroup.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Obtiene todas las unidades de medida (catálogo global).
   */
  async getUnits() {
    return this.prisma.unitOfMeasure.findMany({
      orderBy: { name: 'asc' },
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
   * Actualiza un producto existente.
   */
  async update(
    productId: number,
    updateProductDto: UpdateProductDto,
    user: User,
  ) {
    if (!user.company_id) {
      throw new BadRequestException('Usuario sin compañía asignada');
    }

    // Verificar que el producto existe y pertenece a la compañía
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        company_id: user.company_id,
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const { unit_id, group_id, name, ...rest } = updateProductDto;

    // Si se actualiza la unidad, validar que exista (catálogo global)
    if (unit_id) {
      const unit = await this.prisma.unitOfMeasure.findUnique({
        where: { id: unit_id },
      });

      if (!unit) {
        throw new NotFoundException(
          `La unidad de medida con ID ${unit_id} no existe`,
        );
      }
    }

    // Si se actualiza el grupo, validar que exista (catálogo global)
    if (group_id) {
      const group = await this.prisma.productGroup.findUnique({
        where: { id: group_id },
      });

      if (!group) {
        throw new NotFoundException(`El grupo con ID ${group_id} no existe`);
      }
    }

    // Si se actualiza el nombre, regenerar el slug con el id del producto
    const updateData: any = { ...rest, unit_id, group_id };
    if (name) {
      updateData.name = name;
      updateData.slug = this.generateSlug(name, product.id);
    }

    // Actualizar el producto
    return this.prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        unit: true,
        group: true,
      },
    });
  }

  /**
   * Genera un slug único a partir del nombre y el ID del producto.
   * El ID garantiza unicidad global del slug.
   */
  private generateSlug(name: string, productId: number): string {
    const nameSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio/fin

    return `${nameSlug}-${productId}`;
  }
}
