import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from 'src/user/role.enum';
// 3C)JwtAuthGuard must run first because it is responsible for verifying the JWT and populating request.user. The RolesGuard then reads request.user.role to 
  // check permissions.                                                                                                                                              
  // If the order were reversed, RolesGuard would run before request.user exists. user?.role would be undefined, which is not included in any requiredRoles  
  // array, so every role-protected route would throw a 403 ForbiddenException — even for valid admin users. On routes with no @Roles() decorator the guard  
  // returns true immediately, so those would still work, but any route requiring a specific role would be permanently inaccessible. 
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
