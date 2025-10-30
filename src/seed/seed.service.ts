import { BadRequestException, Injectable } from '@nestjs/common';
import { RoleCreateService } from 'src/role/application/services/role-create.service';
import { RoleFinderService } from 'src/role/application/services/role-finder.service';
import { UserCreateService } from 'src/user/application/services/user-create.service';
import { IUserCreate } from 'src/user/domain/interfaces/user-create.interface';

@Injectable()
export class SeedService {
  constructor(
    private readonly userCreateService: UserCreateService,
    private readonly roleCreateService: RoleCreateService,
    private readonly roleFinderService: RoleFinderService,
  ) {}

  async execute() {
    const allRoles = await this.roleFinderService.findAll();

    if (allRoles.length > 0) {
      throw new BadRequestException('La base de datos ya está inicializada');
    }

    const roles = [
      {
        name: 'admin',
        alias: 'ADMINISTRADOR',
      },
      {
        name: 'company',
        alias: 'EMPRESA',
      },
      {
        name: 'client',
        alias: 'CLIENTE',
      },
    ];

    for (const role of roles) {
      const created = await this.roleCreateService.create(role);

      if (role.name === 'admin') {
        const user = {
          email: 'admin@gmail.com',
          password: 'admin',
          first_name: 'Admin',
          last_name_paternal: 'Root',
          last_name_maternal: 'System',
          dni: '12345678',
          dni_verifier: '0',
          birth_date: new Date('1990-01-01'),
          gender: 'MASCULINO' as const,
          role_id: created.id,
        };
        await this.userCreateService.execute(user);
      }
    }

    return 'La base de datos se ha inicializado correctamente';
  }
}
