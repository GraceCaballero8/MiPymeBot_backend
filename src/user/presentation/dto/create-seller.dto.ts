import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  Matches,
  IsDateString,
} from 'class-validator';

export class CreateSellerDto {
  @IsString()
  @MinLength(2)
  first_name: string;

  @IsString()
  @MinLength(2)
  last_name_paternal: string;

  @IsString()
  @MinLength(2)
  last_name_maternal: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @Matches(/^\d{8}$/, { message: 'DNI must be 8 digits' })
  dni: string;

  @IsDateString()
  birth_date: string;

  @IsEnum(['MASCULINO', 'FEMENINO'])
  gender: 'MASCULINO' | 'FEMENINO';

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  profile_image?: string;
}
