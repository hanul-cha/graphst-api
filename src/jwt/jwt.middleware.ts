import { GraphstProps, Inject, Injectable, MiddlewareInterface } from 'graphst';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements MiddlewareInterface {
  @Inject(() => JwtService)
  jwtService!: JwtService;

  handle(
    props: GraphstProps,
    next: (context?: GraphstProps | undefined) => void
  ): void | Promise<void> {
    const ignorePaths = ['signIn', 'signUp'];
    if (ignorePaths.some((path) => path === props.info.fieldName)) {
      return next();
    }

    if (!props.context.req.headers.authorization) {
      throw new Error('토큰이 없습니다.');
    }

    this.jwtService.verify(props.context.req.headers.authorization);

    // TODO: 토큰 검증 후 사용자 info를 복호화해 context에 추가해주어야함

    return next();
  }
}
