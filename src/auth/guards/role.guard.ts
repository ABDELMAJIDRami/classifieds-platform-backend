import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required role from decorator metadata. The metadataKey: 'role' should match in role.decorator.ts
    const requiredRole = this.reflector.get<string>('role', context.getHandler());

    // If no role is specified, allow access. Exp: @Role('')
    if (!requiredRole) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role.name !== requiredRole) {
      throw new UnauthorizedException(`User does not have the required role: ${requiredRole}`);
    }

    return true;
  }
}