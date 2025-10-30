import { Body, Controller, Post } from '@nestjs/common';
import { AuthLoginService } from '../application/services/auth-login.service';
import { AuthLoginDto } from './dtos/auth-login.dto';
import { AuthRegisterDto } from './dtos/auth-register.dto';
import { AuthRegisterService } from '../application/services/auth-register.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authLoginService: AuthLoginService,
    private readonly authRegisterService: AuthRegisterService,
  ) {}

  @Post('login')
  async login(@Body() body: AuthLoginDto) {
    return await this.authLoginService.execute(body);
  }

  @Post('register')
  async register(@Body() body: AuthRegisterDto) {
    return this.authRegisterService.execute(body);
  }

  
}
