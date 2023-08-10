import { Injectable, MiddlewareInterface } from 'graphst';
import { GraphstApiProps } from '../types';
import { LikeTargetType } from './like.types';

export function createLikeTypeMiddleware(type: LikeTargetType) {
  @Injectable()
  class LikeMiddleware implements MiddlewareInterface {
    handle(
      props: GraphstApiProps,
      next: (props?: GraphstApiProps | undefined) => void
    ): void | Promise<void> {
      return next({
        ...props,
        context: {
          ...props.context,
          likeTargetType: type,
        },
      });
    }
  }

  return LikeMiddleware;
}
