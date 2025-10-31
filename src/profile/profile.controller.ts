import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';

import { ProfileUpdateDto } from 'src/profile/dto/profile-update.dto';
import { ProfileService } from 'src/profile/application/services/profile.service';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('profile')
@Auth(ValidRoles.ADMIN)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Req() req: any) {
    return this.profileService.getProfile(req.user.id);
  }

  @Patch()
  async updateProfile(@Req() req: any, @Body() dto: ProfileUpdateDto) {
    return this.profileService.updateProfile(req.user.id, dto);
  }
}
