import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserFinderService } from './user-finder.service';
import { UserRepository } from 'src/user/infrastructure/user.repository';

@Injectable()
export class UserDeleteService {
  constructor(
    private readonly userFinderService: UserFinderService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: number, id: number) {
    const { role } = await this.validateRole(userId);

    const deleted = await this.userRepository.delete(id);

    return deleted;
  }

  async validateRole(userId: number) {
    const user = await this.userFinderService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (user.role.name !== 'admin') {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      role: user.role.name,
      id: user.id,
    };
  }
}
