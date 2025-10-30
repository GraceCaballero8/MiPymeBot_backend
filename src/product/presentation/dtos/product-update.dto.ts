import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ProductUpdateDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  price: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  stock: number;
}
