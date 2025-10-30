import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from 'src/user/presentation/dto/update-user.dto';
import { UserFinderService } from './user-finder.service';
import { UserRepository } from 'src/user/infrastructure/user.repository';

@Injectable()
export class UserUpdateService {
  constructor(
    private readonly userFinderService: UserFinderService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: number, data: UpdateUserDto, id: number) {
    const { role } = await this.validateRole(userId);

    const updated = await this.userRepository.update(id, data);

    return updated;
  }

  async validateRole(userId: number) {
    const user = await this.userFinderService.findById(userId);

    console.log(user);

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
