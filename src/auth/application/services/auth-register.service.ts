import { BadRequestException, Injectable } from '@nestjs/common';
import { RoleFinderService } from 'src/role/application/services/role-finder.service';
import { UserCreateService } from 'src/user/application/services/user-create.service';
import { UserFinderService } from 'src/user/application/services/user-finder.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthRegisterService {
  constructor(
    private readonly userFinderService: UserFinderService,
    private readonly userCreateService: UserCreateService,
    private readonly roleFinderService: RoleFinderService,
  ) {}

  async execute(data: any) {
    console.log('Datos recibidos:', data);

    // Validar campos obligatorios
    const requiredFields = [
      'email',
      'password',
      'first_name',
      'last_name_paternal',
      'last_name_maternal',
      'dni',
      'dni_verifier',
      'birth_date',
      'gender',
      
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new BadRequestException(`Falta el campo obligatorio: ${field}`);
      }
    }

    // Validar edad y año de nacimiento
    const birth = new Date(data.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    const validAge = age > 18 || (age === 18 && m >= 0);

    if (!validAge) {
      throw new BadRequestException('El administrador debe tener al menos 18 años');
    }

    if (birth.getFullYear() > 2025) {
      throw new BadRequestException('La fecha de nacimiento no puede ser posterior a 2025');
    }

    // Validar que dni_verifier sea exactamente 1 carácter
    if (data.dni_verifier.length !== 1) {
      throw new BadRequestException('El dígito verificador del DNI debe ser un solo carácter');
    }

    // Verificar si ya existe el usuario por email o dni
    const existingEmail = await this.userFinderService.findByEmail(data.email);
    if (existingEmail) {
      throw new BadRequestException('El email ya está registrado');
    }

    const existingDni = await this.userFinderService.findByDni(data.dni);
    if (existingDni) {
      throw new BadRequestException('El DNI ya está registrado');
    }

    //ROL:Siempre Admin(1)
    const role = await this.roleFinderService.findById(1);
    if (!role || role.name.toUpperCase() !== 'ADMIN')
      throw new BadRequestException('Rol ADMIN no encontrado');

    // Convertir string ISO a Date
    const birthDateObj = new Date(data.birth_date);

    
    //Crear usuario
    const created = await this.userCreateService.execute({
      ...data,
      birth_date: birthDateObj, // ← Date real
      role_id: 1, 
    });

    return {
      user: {
        id: created.id,
        email: created.email,
        first_name: created.first_name,
        last_name_paternal: created.last_name_paternal,
        last_name_maternal: created.last_name_maternal,
        role: role.name,
      },
      accessToken: jwt.sign(
        { id: created.id, email: created.email, role: role.name },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' },
      ),
    };
  }
}
