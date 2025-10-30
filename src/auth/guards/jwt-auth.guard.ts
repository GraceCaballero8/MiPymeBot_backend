import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new UnauthorizedException('Token missing');

    const token = authHeader.split(' ')[1];

    try {
      const decoded: any = jwt.verify(token, 'secret');
      request.user = decoded; 
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
