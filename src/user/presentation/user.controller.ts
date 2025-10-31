import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UserFinderService } from '../application/services/user-finder.service';
import { UserUpdateService } from '../application/services/user-update.service';
import { UserDeleteService } from '../application/services/user-delete.service';
import { SellerCreateService } from '../application/services/seller-create.service';
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
    private readonly sellerCreateService: SellerCreateService,
  ) {}

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.userFinderService.findAll(user.id);
  }

  @Get('me')
  async findMe(@GetUser() user: User) {
    return await this.userFinderService.findById(user.id);
  }

  // Obtener vendedores de MI empresa
  @Get('sellers')
  async findSellers(@GetUser() user: any) {
    // Obtener la empresa del admin
    const admin = await this.userFinderService.findById(user.id);

    if (!admin) {
      return [];
    }

    // Si el admin tiene una empresa, obtener sus vendedores
    if (admin.company_id) {
      return await this.userFinderService.findSellersByCompanyId(
        admin.company_id,
      );
    }

    // Si no tiene empresa, devolver array vacío
    return [];
  }

  // Crear vendedor asociado a la empresa del admin
  @Post('sellers')
  async createSeller(
    @GetUser() user: User,
    @Body() createSellerDto: CreateSellerDto,
  ) {
    return await this.sellerCreateService.execute(user.id, createSellerDto);
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
