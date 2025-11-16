import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string; // Nombre del producto

  @IsInt()
  @IsPositive()
  @IsOptional()
  unit_id?: number; // ID de la unidad de medida

  @IsInt()
  @IsPositive()
  @IsOptional()
  group_id?: number; // ID del grupo

  @IsInt()
  @Min(0)
  @IsOptional()
  min_stock?: number; // Stock mínimo

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number; // Precio de venta
}
