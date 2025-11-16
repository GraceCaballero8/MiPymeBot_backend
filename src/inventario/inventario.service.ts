import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MovementType, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto } from './dto/create-movement.dto';

@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra un movimiento de inventario (INGRESO o EGRESO).
   * Este es el corazón del Kardex: cada movimiento es una fila inmutable.
   */
  async createMovement(createMovementDto: CreateMovementDto, user: User) {
    const { product_code, type, quantity, movement_date, observations } =
      createMovementDto;

    if (!user.company_id) {
      throw new NotFoundException('Usuario sin compañía asignada');
    }

    // Buscar el producto por SKU dentro de la compañía del usuario
    const product = await this.prisma.product.findUnique({
      where: {
        sku_company_id: {
          sku: product_code,
          company_id: user.company_id,
        },
      },
    });

    if (!product) {
      throw new NotFoundException(
        `El producto con código "${product_code}" no existe en tu catálogo`,
      );
    }

    // Si es EGRESO, validar que haya stock suficiente
    if (type === MovementType.EGRESO) {
      // Calcular el stock actual del producto
      const movements = await this.prisma.inventoryMovement.findMany({
        where: {
          product_id: product.id,
          company_id: user.company_id,
        },
        select: {
          quantity: true,
          type: true,
        },
      });

      const totalIngresos = movements
        .filter((m) => m.type === MovementType.INGRESO)
        .reduce((sum, m) => sum + m.quantity, 0);

      const totalEgresos = movements
        .filter((m) => m.type === MovementType.EGRESO)
        .reduce((sum, m) => sum + m.quantity, 0);

      const stockActual = totalIngresos - totalEgresos;

      // Validar que no se exceda el stock disponible
      if (quantity > stockActual) {
        throw new BadRequestException(
          `No hay stock suficiente. Stock actual: ${stockActual}, cantidad solicitada: ${quantity}`,
        );
      }
    }

    // Crear el movimiento en el Kardex
    const movement = await this.prisma.inventoryMovement.create({
      data: {
        product_id: product.id,
        type,
        quantity,
        movement_date: new Date(movement_date),
        observations,
        user_id: user.id,
        company_id: user.company_id,
      },
      include: {
        product: {
          select: {
            sku: true,
            name: true,
          },
        },
      },
    });

    return {
      ...movement,
      message:
        type === MovementType.INGRESO
          ? `Ingreso de ${quantity} unidades registrado exitosamente`
          : `Egreso de ${quantity} unidades registrado exitosamente`,
    };
  }

  /**
   * Obtiene el estado actual del inventario de la compañía.
   *
   * AQUÍ ESTÁ LA MAGIA DEL KARDEX:
   * El stock NO se guarda en una columna que editamos.
   * El stock ES UN CÁLCULO: SUM(INGRESOS) - SUM(EGRESOS)
   *
   * Esto evita condiciones de carrera y da auditoría completa.
   */
  async getInventoryStatus(company_id: number) {
    // Obtener todos los productos de la compañía
    const products = await this.prisma.product.findMany({
      where: {
        company_id,
      },
      include: {
        unit: {
          select: {
            abbreviation: true,
          },
        },
        group: {
          select: {
            name: true,
          },
        },
        movements: {
          select: {
            quantity: true,
            type: true,
          },
        },
      },
    });

    // Calcular el stock actual para cada producto
    const inventoryStatus = products.map((product) => {
      // Sumar todos los ingresos
      const totalIngresos = product.movements
        .filter((m) => m.type === MovementType.INGRESO)
        .reduce((sum, m) => sum + m.quantity, 0);

      // Sumar todos los egresos
      const totalEgresos = product.movements
        .filter((m) => m.type === MovementType.EGRESO)
        .reduce((sum, m) => sum + m.quantity, 0);

      // Stock actual = Ingresos - Egresos
      const stock_actual = totalIngresos - totalEgresos;

      // Determinar el estado según el stock mínimo
      let estado: 'Sin Stock' | 'Stock Bajo' | 'Stock OK';
      if (stock_actual === 0) {
        estado = 'Sin Stock';
      } else if (stock_actual <= product.min_stock) {
        estado = 'Stock Bajo';
      } else {
        estado = 'Stock OK';
      }

      return {
        codigo: product.sku,
        nombre: product.name,
        unidad: product.unit.abbreviation,
        grupo: product.group.name,
        stock_minimo: product.min_stock,
        stock_actual,
        estado,
      };
    });

    return inventoryStatus;
  }

  /**
   * Obtiene el historial de movimientos de un producto específico (Kardex completo).
   */
  async getProductKardex(product_sku: string, company_id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        sku_company_id: {
          sku: product_sku,
          company_id,
        },
      },
      include: {
        movements: {
          orderBy: {
            movement_date: 'asc',
          },
          include: {
            user: {
              select: {
                first_name: true,
                last_name_paternal: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(
        `El producto con código "${product_sku}" no existe`,
      );
    }

    // Calcular el saldo acumulado en cada movimiento
    let saldo = 0;
    const kardex = product.movements.map((movement) => {
      if (movement.type === MovementType.INGRESO) {
        saldo += movement.quantity;
      } else {
        saldo -= movement.quantity;
      }

      return {
        fecha: movement.movement_date,
        tipo: movement.type,
        cantidad: movement.quantity,
        saldo,
        observaciones: movement.observations,
        registrado_por: `${movement.user.first_name} ${movement.user.last_name_paternal}`,
      };
    });

    return {
      producto: {
        sku: product.sku,
        nombre: product.name,
      },
      kardex,
    };
  }
}
