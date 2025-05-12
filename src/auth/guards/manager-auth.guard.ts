import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ManagerAuthGuard extends AuthGuard('manager') {  // 'manager' should match in both AuthGuard('manager') and PassportStrategy(Strategy, 'manager')
  constructor() {
    super({session: true});
  }

  async canActivate(context: any): Promise<boolean> {
    // Runs the ManagerStrategy first, call ManagerStrategy.validate and validates his credentials and role.
    // result is boolean, but Passport has stored the validated user in request.user internally at this point.
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    
    // If manager validation was successful, initialize the session and authenticate the user.
    // It will take request.user (the user from ManagerStrategy.validate) and pass it to serializeUser
    await super.logIn(request);
    
    return result;
  }
}
