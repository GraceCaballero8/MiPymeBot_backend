import { Injectable } from '@nestjs/common';
import { IRoleCreate } from 'src/role/domain/interfaces/role-create.interface';
import { RoleRepository } from 'src/role/infrastructure/repositories/role.repository';

@Injectable()
export class RoleCreateService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async create(role: IRoleCreate) {
    return this.roleRepository.create(role);
  }
}
