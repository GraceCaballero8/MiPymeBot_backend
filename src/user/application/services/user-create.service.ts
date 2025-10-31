import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserCreate } from 'src/user/domain/interfaces/user-create.interface';
import { UserRepository } from 'src/user/infrastructure/user.repository';

@Injectable()
export class UserCreateService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(data: IUserCreate) {
    data.password = await bcrypt.hash(data.password, 10);

    return this.userRepository.create(data);
  }
}
