import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Simply checks req.isAuthenticated()
    // By this point, deserializeUser has already run via session middleware as explained in getProfile() in AuthController
    // req.user is already populated if session was valid
    console.log(request.isAuthenticated())
    console.log('Session:', request.session);
    console.log('Is authenticated:', request.isAuthenticated());

    if (!request.isAuthenticated()) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    return true;
  }
}