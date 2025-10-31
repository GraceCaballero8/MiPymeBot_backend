import { Reflector } from '@nestjs/core';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '@prisma/client';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.getAllAndOverride(META_ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as any;

    if (!user) throw new BadRequestException('User not found'); // Si no hay usuario, no se permite el acceso

    // En la versión Prisma el usuario tiene una relación `role` (role.name)
    const userRole = user.role?.name;

    if (!userRole) throw new BadRequestException('User has no role assigned');

    if (validRoles.includes(userRole)) return true;

    throw new ForbiddenException(
      `User ${user.first_name + ' ' + (user.last_name_paternal ?? '')} need a valid role: [${validRoles}]`,
    ); // Si no, se lanza una excepción de acceso denegado
  }
}
