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
  company_index?: number; // Índice del admin al que pertenece (solo para vendedores)
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
    // Admin principal - se le creará una compañía automáticamente
    {
      email: 'admin@gmail.com',
      password: 'admin',
      first_name: 'Admin',
      last_name_paternal: 'Root',
      last_name_maternal: 'System',
      dni: '12345678',
      dni_verifier: '0',
      birth_date: new Date('1990-01-01'),
      role_id: 1, // ADMIN - se creará compañía automáticamente
      gender: 'MASCULINO',
      status: 'ACTIVE',
    },
    // Vendedor del primer admin (company_index: 0)
    {
      email: 'vendedor1@gmail.com',
      password: 'vendedor1',
      first_name: 'Juan',
      last_name_paternal: 'Pérez',
      last_name_maternal: 'López',
      dni: '23456789',
      dni_verifier: '1',
      birth_date: new Date('1995-03-20'),
      role_id: 2, // VENDEDOR
      gender: 'MASCULINO',
      status: 'ACTIVE',
      company_index: 0, // Pertenece a la compañía del primer admin
    },
    // Puedes agregar más admins y vendedores
    // {
    //   email: 'admin2@gmail.com',
    //   password: 'admin2',
    //   first_name: 'María',
    //   last_name_paternal: 'González',
    //   last_name_maternal: 'Pérez',
    //   dni: '87654321',
    //   dni_verifier: '5',
    //   birth_date: new Date('1992-05-15'),
    //   role_id: 1, // ADMIN - se creará compañía automáticamente
    //   gender: 'FEMENINO',
    //   status: 'ACTIVE',
    // },
    // {
    //   email: 'vendedor2@gmail.com',
    //   password: 'vendedor2',
    //   first_name: 'Ana',
    //   last_name_paternal: 'Martínez',
    //   last_name_maternal: 'Ruiz',
    //   dni: '34567890',
    //   dni_verifier: '2',
    //   birth_date: new Date('1998-07-10'),
    //   role_id: 2, // VENDEDOR
    //   gender: 'FEMENINO',
    //   status: 'ACTIVE',
    //   company_index: 1, // Pertenece a la compañía del segundo admin
    // },
  ],
};
