import { GraphstProps, Inject, Injectable, MiddlewareInterface } from 'graphst';
import { JwtService } from './jwt.service';
import { JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class JwtMiddleware implements MiddlewareInterface {
  @Inject(() => JwtService)
  jwtService!: JwtService;

  handle(
    props: GraphstProps,
    next: (props?: GraphstProps | undefined) => void
  ): void | Promise<void> {
    const authorization = props.context.req.headers.authorization ?? '';
    const token = authorization.replace('Bearer ', '');

    try {
      const decodedToken = this.jwtService.verify(token);
      const propWithAuth = {
        ...props,
        context: {
          ...props.context,
          auth: decodedToken,
        },
      };

      return next(propWithAuth);
    } catch (error: any) {
      if (error instanceof JsonWebTokenError) {
        return next();
      }
      throw new Error(error);
    }
  }
}
