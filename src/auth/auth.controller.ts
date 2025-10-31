import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { Auth } from './decorators/auth.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Get('testing-auth')
  @Auth() //@Auth(validRoles.ADMIN, validRoles.VENUE)... y asi con valid roles en interfaces
  checkAuthStatus(@GetUser() user: any) {
    return 'OK - Authenticated';
  }
}
