import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayLoad } from '../interfaces/jwt-payload.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'saubduksnsndjsnsdnl',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayLoad): Promise<User> {
    const { id } = payload;

    // Usamos Prisma para obtener el usuario y su rol
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) throw new UnauthorizedException('Token not valid');

    // En el esquema Prisma el campo de estado se llama `status`
    if (user.status === 'INACTIVE')
      throw new UnauthorizedException('User inactive');

    return user;
  }
}
