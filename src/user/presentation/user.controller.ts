import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFinderService } from '../application/services/user-finder.service';
import { UserUpdateService } from '../application/services/user-update.service';
import { UserDeleteService } from '../application/services/user-delete.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Auth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userFinderService: UserFinderService,
    private readonly userUpdateService: UserUpdateService,
    private readonly userDeleteService: UserDeleteService,
  ) {}

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.userFinderService.findAll(user.id);
  }

  @Get('me')
  async findMe(@GetUser() user: User) {
    return await this.userFinderService.findById(user.id);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') userId: number,
    @Body() body: UpdateUserDto,
    @GetUser() user: User,
  ) {
    return await this.userUpdateService.execute(user.id, body, userId);
  }

  @Delete(':id')
  async deleteUser(@Param('id') userId: number, @GetUser() user: User) {
    return await this.userDeleteService.execute(user.id, userId);
  }
}
