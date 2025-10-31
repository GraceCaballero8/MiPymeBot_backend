import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsDateString,
  Matches,
  IsNumber,
} from 'class-validator';

export enum GenderEnum {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
  password: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name_paternal: string;

  @IsOptional()
  @IsString()
  last_name_maternal?: string;

  @IsString()
  dni: string;

  @IsString()
  @Matches(/^[A-Za-z0-9]$/)
  dni_verifier: string;

  @IsDateString()
  birth_date: string;

  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  role_id?: number;
}
