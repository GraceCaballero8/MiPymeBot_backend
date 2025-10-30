import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserFinderService } from 'src/user/application/services/user-finder.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthLoginService {
  constructor(private readonly userFinderService: UserFinderService) {}

  async execute(data: any) {
    const user = await this.userFinderService.findByEmail(data.email);
    console.log('Usuario encontrado:', user);


    if (!user) {
      throw new UnauthorizedException('Error al autenticar');
    }

    const response = await bcrypt.compare(data.password, user.password);
    if (!response) throw new UnauthorizedException('Error al autenticar');

    if( user.role.name !== 'admin' && user.role.name !== 'seller'){
      throw new UnauthorizedException('Acceso restringido para Administradores y Vendedores')
    }

    const payload = jwt.sign(
      {
        id: user.id, email: user.email, role: user.role.name
      },
      'secret',
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: `${user.first_name} ${user.last_name_paternal} ${user.last_name_maternal}`,
        role: user.role.name,
      },
      accessToken: payload,
    };
  }
}
