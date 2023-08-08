import { GraphstError, Injectable, MiddlewareInterface } from 'graphst';
import { GraphstApiProps } from '../types';

@Injectable()
export class AuthGuardMiddleware implements MiddlewareInterface {
  handle(
    props: GraphstApiProps,
    next: (props?: GraphstApiProps | undefined) => void
  ): void | Promise<void> {
    if (!props.context.auth?.id) {
      throw new GraphstError('lack of authority');
    }
    return next();
  }
}
