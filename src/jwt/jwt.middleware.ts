import { GraphstProps, Inject, Injectable, MiddlewareInterface } from 'graphst';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements MiddlewareInterface {
  @Inject(() => JwtService)
  jwtService!: JwtService;

  handle(
    props: GraphstProps,
    next: (props?: GraphstProps | undefined) => void
  ): void | Promise<void> {
    const ignorePaths = ['signIn', 'signUp'];
    if (ignorePaths.some((path) => path === props.info.fieldName)) {
      return next();
    }

    const authorization = props.context.req.headers.authorization;

    if (!authorization) {
      throw new Error('token is not exist');
    }
    const token = authorization.replace('Bearer ', '');

    const decodedToken = this.jwtService.verify(token);
    const propWithAuth = {
      ...props,
      context: {
        ...props.context,
        auth: decodedToken,
      },
    };

    return next(propWithAuth);
  }
}
