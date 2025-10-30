import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFinderService } from '../application/services/user-finder.service';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserUpdateService } from '../application/services/user-update.service';
import { UserDeleteService } from '../application/services/user-delete.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userFinderService: UserFinderService,
    private readonly userUpdateService: UserUpdateService,
    private readonly userDeleteService: UserDeleteService,
  ) {}

  @Get()
  async findAll(@Req() req: Request) {
    const headers = req.get('Authorization');
    if (!headers) throw new UnauthorizedException('No authorization header');
    const token = headers.split(' ')[1];
    if (!token) throw new UnauthorizedException('No authorization header');
    const { id } = jwt.verify(token, 'secret') as JwtPayload & { id: number };

    return await this.userFinderService.findAll(id);
  }

  @Get('me')
  async findMe(@Req() req: Request) {
    const headers = req.get('Authorization');
    if (!headers) throw new UnauthorizedException('No authorization header');
    const token = headers.split(' ')[1];
    if (!token) throw new UnauthorizedException('No authorization header');
    const { id } = jwt.verify(token, 'secret') as JwtPayload & { id: number };

    return await this.userFinderService.findById(id);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') userId: number,
    @Body() body: UpdateUserDto,
    @Req() req: Request,
  ) {
    const headers = req.get('Authorization');
    if (!headers) throw new UnauthorizedException('No authorization header');
    const token = headers.split(' ')[1];
    if (!token) throw new UnauthorizedException('No authorization header');
    const { id } = jwt.verify(token, 'secret') as JwtPayload & { id: number };

    return await this.userUpdateService.execute(id, body, userId);
  }

  @Delete(':id')
  async deleteUser(@Param('id') userId: number, @Req() req: Request) {
    const headers = req.get('Authorization');
    if (!headers) throw new UnauthorizedException('No authorization header');
    const token = headers.split(' ')[1];
    if (!token) throw new UnauthorizedException('No authorization header');
    const { id } = jwt.verify(token, 'secret') as JwtPayload & { id: number };

    return await this.userDeleteService.execute(id, userId);
  }
}
