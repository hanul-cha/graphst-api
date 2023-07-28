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
        // TODO: 이거 조치를 취해야겠음 데코레이터를 통해 글로벌 미들웨어보다 먼저 처리되는 방식을 찾아야겠음
        const ignorePaths = new Set([
          'signIn',
          'signUp',
          'validateQuestion',
          'changePassword',
          'categories',
          'posts',
          'getPost',
          'countFollower',
          'countPost',
          'isLike',
          'comments',
          'getUserPublic',
        ]);
        const ignoreParents = new Set(['Post', 'Comment', 'User']);
        if (
          ignoreParents.has(`${props.info.parentType}`) ||
          ignorePaths.has(props.info.fieldName)
        ) {
          return next();
        }
        throw new Error('token is not valid');
      }
      throw new Error(error);
    }
  }
}
