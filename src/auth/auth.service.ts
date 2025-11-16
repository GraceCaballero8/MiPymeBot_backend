import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayLoad } from './interfaces/jwt-payload.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const email = loginUserDto.email;
    const password = loginUserDto.password;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const emailLower = email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email: emailLower },
      include: { role: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    // Permitir acceso a admin y vendedor
    const roleName = user.role?.name ?? '';
    if (roleName !== 'admin' && roleName !== 'vendedor') {
      throw new UnauthorizedException('Access restricted');
    }

    return {
      user: this.buildUserResponse(user),
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const birth = new Date(createUserDto.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    const validAge = age > 18 || (age === 18 && m >= 0);
    if (!validAge) {
      throw new BadRequestException(
        'Debes tener al menos 18 años para registrarte',
      );
    }
    if (birth.getFullYear() > 2025) {
      throw new BadRequestException(
        'La fecha de nacimiento no puede ser posterior a 2025',
      );
    }

    if ((createUserDto.dni_verifier ?? '').length !== 1) {
      throw new BadRequestException(
        'El dígito verificador del DNI debe ser un solo carácter',
      );
    }

    const emailLower = createUserDto.email.toLowerCase().trim();

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const existingEmail = await tx.user.findUnique({
          where: { email: emailLower },
        });
        if (existingEmail)
          throw new BadRequestException('El email ya está registrado');

        const existingDni = await tx.user.findUnique({
          where: { dni: createUserDto.dni },
        });
        if (existingDni)
          throw new BadRequestException('El DNI ya está registrado');

        // Por defecto registrar como vendedor (role_id = 2)
        const roleId = createUserDto.role_id ?? 2;
        const role = await tx.role.findUnique({ where: { id: roleId } });
        if (!role) {
          throw new BadRequestException('Rol no encontrado');
        }

        const hashed = await bcrypt.hash(createUserDto.password, 10);

        // Crear usuario admin
        const createdUser = await tx.user.create({
          data: {
            email: emailLower,
            password: hashed,
            first_name: createUserDto.first_name,
            last_name_paternal: createUserDto.last_name_paternal,
            last_name_maternal: createUserDto.last_name_maternal || '',
            dni: createUserDto.dni,
            dni_verifier: createUserDto.dni_verifier,
            birth_date: birth,
            gender: createUserDto.gender,
            role_id: roleId,
          },
          include: { role: true },
        });

        // Solo crear compañía si es admin
        if (role.name === 'admin') {
          const defaultCompanyName = `Empresa de ${createdUser.first_name} ${createdUser.last_name_paternal}`;
          const company = await tx.company.create({
            data: {
              name: defaultCompanyName,
              admin_id: createdUser.id,
              sector: 'General',
              description:
                'Completa la información de tu empresa en "Mi Tienda"',
            },
          });

          // Actualizar el usuario con la compañía creada
          const updatedUser = await tx.user.update({
            where: { id: createdUser.id },
            data: { company_id: company.id },
            include: { role: true },
          });

          return updatedUser;
        }

        // Si es vendedor, retornar sin compañía
        return createdUser;
      });

      const token = this.getJwtToken({ id: created.id });

      return {
        user: this.buildUserResponse(created),
        token: token,
      };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      this.handlePrismaError(error);
    }
  }

  private getJwtToken(payload: JwtPayLoad) {
    return this.jwtService.sign(payload);
  }

  private buildUserResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name_paternal: user.last_name_paternal,
      last_name_maternal: user.last_name_maternal,
      role: user.role?.name,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  private handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta as any)?.target || 'field';
        throw new BadRequestException(`Unique constraint failed on ${target}`);
      }
    }

    throw new InternalServerErrorException('Database error');
  }
}
