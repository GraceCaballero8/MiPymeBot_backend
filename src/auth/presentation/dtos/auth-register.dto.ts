import {
  IsEmail,
  IsString,
  Length,
  IsDateString,
  Matches,
  IsEnum,
} from 'class-validator';

enum Gender {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
}

export class AuthRegisterDto {
  @IsEmail() email: string;

  @IsString()  password: string;

  @IsString()  first_name: string;

  @IsString()  last_name_paternal: string;

  @IsString()  last_name_maternal: string;

  @IsString()  @Length(8, 8)  dni: string;

  @IsString()  @Length(1, 1)  dni_verifier: string;

  @IsDateString()  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe estar en formato YYYY-MM-DD',
  })
  birth_date: string;

  @IsEnum(Gender)  gender: Gender;
}