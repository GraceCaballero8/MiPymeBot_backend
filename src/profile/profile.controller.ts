import { Controller, Get, Patch, Body } from '@nestjs/common';

import { ProfileUpdateDto } from 'src/profile/dto/profile-update.dto';
import { ProfileService } from 'src/profile/application/services/profile.service';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Controller('profile')
@Auth(ValidRoles.ADMIN)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@GetUser() user: User) {
    return this.profileService.getProfile(user.id);
  }

  @Patch()
  async updateProfile(@GetUser() user: User, @Body() dto: ProfileUpdateDto) {
    return this.profileService.updateProfile(user.id, dto);
  }
}
