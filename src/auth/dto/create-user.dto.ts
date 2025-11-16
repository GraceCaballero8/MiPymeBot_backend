import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
} from 'class-validator';

export enum GenderEnum {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
}

export class CreateUserDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsString({ message: 'El nombre es requerido' })
  first_name: string;

  @IsString({ message: 'El apellido paterno es requerido' })
  last_name_paternal: string;

  @IsOptional()
  @IsString({ message: 'El apellido materno debe ser un texto' })
  last_name_maternal?: string;

  @IsString({ message: 'El DNI es requerido' })
  dni: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser válida' })
  birth_date: string;

  @IsEnum(GenderEnum, { message: 'El género debe ser MASCULINO o FEMENINO' })
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
