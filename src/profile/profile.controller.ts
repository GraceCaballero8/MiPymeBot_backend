import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileUpdateDto } from 'src/profile/dto/profile-update.dto';
import { ProfileService } from 'src/profile/application/services/profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
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