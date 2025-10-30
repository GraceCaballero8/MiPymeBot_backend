import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthLoginService } from './application/services/auth-login.service';
import { AuthRegisterService } from './application/services/auth-register.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './presentation/auth.controller';
import { UserFinderService } from 'src/user/application/services/user-finder.service';
import { UserCreateService } from 'src/user/application/services/user-create.service';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleFinderService } from 'src/role/application/services/role-finder.service';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'secret', 
      signOptions: { expiresIn: '1d' },
    }),
    UserModule,
    RoleModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthLoginService,
    AuthRegisterService,
    JwtStrategy,
    UserFinderService,
    UserCreateService,
    RoleFinderService,
    PrismaService,
  ],
  exports: [JwtModule],
})


export class AuthModule {}
