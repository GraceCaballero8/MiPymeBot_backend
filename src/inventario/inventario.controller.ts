import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { User } from '@prisma/client';
import { InventarioService } from './inventario.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('inventory')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  /**
   * ENDPOINT 2: Para tu pantalla "Registro de Movimientos"
   * Crea un nuevo movimiento (INGRESO o EGRESO) en el Kardex.
   *
   * POST /inventory/movements
   * Body: { product_code, type, quantity, movement_date, observations? }
   */
  @Post('movements')
  @Auth()
  createMovement(
    @Body() createMovementDto: CreateMovementDto,
    @GetUser() user: User,
  ) {
    return this.inventarioService.createMovement(createMovementDto, user);
  }

  /**
   * ENDPOINT 3: Para tu pantalla "Control de Inventario"
   * Obtiene la lista de productos de la compañía con su stock ACTUAL CALCULADO.
   *
   * GET /inventory/status
   *
   * AQUÍ ESTÁ LA MAGIA DEL KARDEX:
   * No guardamos el stock en una columna.
   * Lo CALCULAMOS sumando todos los movimientos: SUM(Ingresos) - SUM(Egresos)
   */
  @Get('status')
  @Auth()
  getInventoryStatus(@GetUser() user: User) {
    if (!user.company_id) {
      throw new Error('Usuario sin compañía asignada');
    }
    return this.inventarioService.getInventoryStatus(user.company_id);
  }

  /**
   * ENDPOINT (Bonus): Obtiene el Kardex completo de un producto específico
   * Muestra todos los movimientos con el saldo acumulado.
   *
   * GET /inventory/kardex?sku=PT0002
   */
  @Get('kardex')
  @Auth()
  getProductKardex(@GetUser() user: User, @Query('sku') sku: string) {
    if (!user.company_id) {
      throw new Error('Usuario sin compañía asignada');
    }
    return this.inventarioService.getProductKardex(sku, user.company_id);
  }
}
