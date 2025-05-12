import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: any, done: (err: Error | null, user: any) => void): void {
    done(null, user.id);
  }

  async deserializeUser(
    userId: number,
    done: (err: Error | null, payload: any) => void,
  ): Promise<void> {
    try {
      const user = await this.usersService.findOne(userId);
      // Remove password from the user object
      const { password, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error, null);
    }
  }
}