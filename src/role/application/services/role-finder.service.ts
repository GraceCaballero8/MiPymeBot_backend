import { Injectable } from '@nestjs/common';
import { RoleRepository } from 'src/role/infrastructure/repositories/role.repository';

@Injectable()
export class RoleFinderService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async findAll() {
    return this.roleRepository.findAll();
  }

  async findById(id: number) {
    return this.roleRepository.findById(id);
  }
}
