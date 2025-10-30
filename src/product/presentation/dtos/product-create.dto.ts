import { Transform } from 'class-transformer';
import { IsString, IsInt, IsNotEmpty, Min } from 'class-validator';

export class ProductCreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  price: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  stock: number;

  @IsInt() 
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  company_id: number; 
}
