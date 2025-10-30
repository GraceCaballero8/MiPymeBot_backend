import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/user/infrastructure/user.repository';

@Injectable()
export class UserFinderService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(userId: number) {
    const { id, role } = await this.validateRole(userId);

    if (role === 'admin') {
      return await this.userRepository.findAllWithoudAdmin();
    }

    return await this.userRepository.findAll();
  }

  async findAllWithoutAdmin() {
    return await this.userRepository.findAllWithoudAdmin();
  }

  async findById(id: number) {
    return await this.userRepository.findById(id);
  }

  async findByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async findByDni(dni: string) {
    return await this.userRepository.findByDni(dni);
  }

  async validateRole(userId: number) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      role: user.role.name,
      id: user.id,
    };
  }
}
