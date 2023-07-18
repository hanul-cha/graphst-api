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
    } catch (error) {
      const ignorePaths = [
        'signIn',
        'signUp',
        'validateQuestion',
        'changePassword',
        'categories',
        'posts',
        'getPost',
      ];
      const ignoreParents = ['Post'];
      if (
        ignoreParents.some((path) => path === `${props.info.parentType}`) ||
        ignorePaths.some((path) => path === props.info.fieldName)
      ) {
        return next();
      }
      throw new Error('token is not valid');
    }
  }
}
