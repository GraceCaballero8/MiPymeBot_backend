import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';

interface SeedUsuario {
  email: string;
  password: string;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  dni: string;
  dni_verifier: string;
  birth_date: Date;
  role_id: number;
  gender: 'MASCULINO' | 'FEMENINO';
  status?: 'ACTIVE' | 'INACTIVE';
}

interface SeedRole {
  id: number;
  name: string;
  alias: string;
}

interface SeedData {
  roles: SeedRole[];
  users: SeedUsuario[];
}

export const seedData: SeedData = {
  roles: [
    { id: 1, name: ValidRoles.ADMIN, alias: 'ADMINISTRADOR' },
    { id: 2, name: ValidRoles.VENDEDOR, alias: 'VENDEDOR' },
  ],
  users: [
    {
      email: 'admin@gmail.com',
      password: 'admin',
      first_name: 'Admin',
      last_name_paternal: 'Root',
      last_name_maternal: 'System',
      dni: '12345678',
      dni_verifier: '0',
      birth_date: new Date('1990-01-01'),
      role_id: 1,
      gender: 'MASCULINO',
      status: 'ACTIVE',
    },
  ],
};
