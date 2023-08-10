import { Inject, Mutation, Resolver } from 'graphst';
import { Like } from '../like.entity';
import { LikeService } from '../like.service';
import { GraphQLBoolean, GraphQLNonNull, GraphQLString } from 'graphql';
import { LikeTargetType, VerifiedLikeContext } from '../like.types';
import { AuthGuardMiddleware } from '../../auth/auth.guard.middleware';
import { createLikeTypeMiddleware } from '../like.middleware';

@Resolver({
  key: () => Like,
  middlewares: [AuthGuardMiddleware],
})
export class LikeVerifiedResolver {
  @Inject(() => LikeService)
  likeService!: LikeService;

  @Mutation({
    args: {
      targetId: () => GraphQLNonNull(GraphQLString),
      like: () => GraphQLNonNull(GraphQLBoolean),
    },
    middlewares: [createLikeTypeMiddleware(LikeTargetType.CommentLike)],
    returnType: () => GraphQLBoolean,
    name: 'toggleLikeCommentLike',
  })
  @Mutation({
    args: {
      targetId: () => GraphQLNonNull(GraphQLString),
      like: () => GraphQLNonNull(GraphQLBoolean),
    },
    middlewares: [createLikeTypeMiddleware(LikeTargetType.CommentUnlike)],
    returnType: () => GraphQLBoolean,
    name: 'toggleLikeCommentUnlike',
  })
  @Mutation({
    args: {
      targetId: () => GraphQLNonNull(GraphQLString),
      like: () => GraphQLNonNull(GraphQLBoolean),
    },
    middlewares: [createLikeTypeMiddleware(LikeTargetType.Post)],
    returnType: () => GraphQLBoolean,
    name: 'toggleLikePost',
  })
  @Mutation({
    args: {
      targetId: () => GraphQLNonNull(GraphQLString),
      like: () => GraphQLNonNull(GraphQLBoolean),
    },
    middlewares: [createLikeTypeMiddleware(LikeTargetType.User)],
    returnType: () => GraphQLBoolean,
    name: 'toggleLikeUser',
  })
  async toggleLike(
    _: null,
    args: { targetId: string; like: boolean },
    ctx: VerifiedLikeContext
  ) {
    if (args.like) {
      await this.likeService.createLikeLink(
        ctx.likeTargetType,
        args.targetId,
        `${ctx.auth.id}`
      );
    } else {
      await this.likeService.deleteLikeLink(
        ctx.likeTargetType,
        args.targetId,
        `${ctx.auth.id}`
      );
    }

    return true;
  }
}
