import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MovementType } from '@prisma/client';

export class CreateMovementDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  product_code: string; // Código del producto (SKU), ej: "PT0002"

  @IsEnum(MovementType)
  type: MovementType; // INGRESO o EGRESO

  @IsInt()
  @IsPositive()
  quantity: number; // Cantidad (siempre positiva)

  @IsDateString()
  movement_date: string; // Fecha del movimiento en formato ISO, ej: "2025-03-09T00:00:00Z"

  @IsString()
  @IsOptional()
  @MaxLength(500)
  observations?: string; // Observaciones opcionales
}
