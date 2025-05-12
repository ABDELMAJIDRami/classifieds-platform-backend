import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class ManagerStrategy extends PassportStrategy(Strategy, 'manager') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      const user = await this.authService.validateManager(email, password);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid manager credentials or insufficient permissions');
    }
  }
}
