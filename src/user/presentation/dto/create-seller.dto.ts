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
  @IsString({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  first_name: string;

  @IsString({ message: 'El apellido paterno es requerido' })
  @MinLength(2, {
    message: 'El apellido paterno debe tener al menos 2 caracteres',
  })
  last_name_paternal: string;

  @IsString({ message: 'El apellido materno es requerido' })
  @MinLength(2, {
    message: 'El apellido materno debe tener al menos 2 caracteres',
  })
  last_name_maternal: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsString({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsString({ message: 'El DNI es requerido' })
  @Matches(/^\d{8}$/, { message: 'El DNI debe tener 8 dígitos' })
  dni: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser válida' })
  birth_date: string;

  @IsEnum(['MASCULINO', 'FEMENINO'], {
    message: 'El género debe ser MASCULINO o FEMENINO',
  })
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
