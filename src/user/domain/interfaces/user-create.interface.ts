export interface IUserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  dni: string;
  dni_verifier: string;
  birth_date: Date;
  gender: 'MASCULINO' | 'FEMENINO';
  role_id: number;
  status?: 'ACTIVE' | 'INACTIVE';
  company_id?: number;
  phone?: string;
  address?: string;
  profile_image?: string;
}
