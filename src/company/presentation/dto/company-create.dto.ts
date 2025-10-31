import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  Matches,
} from 'class-validator';

export class CompanyCreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @Length(11)
  @Matches(/^[0-9]+$/, { message: 'RUC debe contener solo números' })
  ruc?: string;

  @IsString()
  @IsNotEmpty()
  sector: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;
}
