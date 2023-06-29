import { Injectable, MiddlewareInterface } from 'graphst';
import { GraphstApiProps } from '../types';
import { AuthRole } from './user.types';

export function createRolesMiddleware(roles: AuthRole[]) {
  @Injectable()
  class RolesMiddleware implements MiddlewareInterface {
    handle(
      props: GraphstApiProps,
      next: (props?: GraphstApiProps | undefined) => void
    ): void | Promise<void> {
      const userRoles = props.context.auth.roles;
      if (
        userRoles &&
        (userRoles.includes(AuthRole.DEVELOPER) ||
          userRoles.some((role) => roles.includes(role)))
      ) {
        return next();
      }

      throw new Error('no access');
    }
  }

  return RolesMiddleware;
}
