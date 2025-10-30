import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Gender } from '@prisma/client';

export class ProfileUpdateDto {
  @IsOptional() @IsString() first_name?: string;
  @IsOptional() @IsString() last_name_paternal?: string;
  @IsOptional() @IsString() last_name_maternal?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsDateString() birth_date?: string;
  @IsOptional() @IsEnum(Gender) gender?: Gender;
  @IsOptional() @IsString() profile_image?: string;
}