import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  sku: string; // Código del producto, ej: "PT0002"

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string; // Nombre del producto, ej: "POLO BASICO TALLA M"

  @IsInt()
  @IsPositive()
  unit_id: number; // ID de la unidad de medida (UnitOfMeasure)

  @IsInt()
  @IsPositive()
  group_id: number; // ID del grupo (ProductGroup)

  @IsInt()
  @Min(0)
  min_stock: number; // Stock mínimo, por defecto 0

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number; // Precio de venta (opcional)
}
