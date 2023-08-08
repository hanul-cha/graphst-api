import { Inject, Mutation, Resolver } from 'graphst';
import { Like } from '../like.entity';
import { LikeService } from '../like.service';
import { GraphQLBoolean, GraphQLNonNull, GraphQLString } from 'graphql';
import { LikeTargetType } from '../like.types';
import { verifiedAuthContext } from '../../types';
import { AuthGuardMiddleware } from '../../auth/auth.guard.middleware';

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
    returnType: () => GraphQLBoolean,
    name: 'toggleLikeCommentLike',
  })
  @Mutation({
    args: {
      targetId: () => GraphQLNonNull(GraphQLString),
      like: () => GraphQLNonNull(GraphQLBoolean),
    },
    returnType: () => GraphQLBoolean,
    name: 'toggleLikeCommentUnlike',
  })
  @Mutation({
    args: {
      targetId: () => GraphQLNonNull(GraphQLString),
      like: () => GraphQLNonNull(GraphQLBoolean),
    },
    returnType: () => GraphQLBoolean,
    name: 'toggleLikePost',
  })
  @Mutation({
    args: {
      targetId: () => GraphQLNonNull(GraphQLString),
      like: () => GraphQLNonNull(GraphQLBoolean),
    },
    returnType: () => GraphQLBoolean,
    name: 'toggleLikeUser',
  })
  async toggleLike(
    _: null,
    args: { targetId: string; like: boolean },
    ctx: verifiedAuthContext,
    info: { fieldName: string }
  ) {
    const targetType =
      info.fieldName === 'toggleLikeUser'
        ? LikeTargetType.User
        : info.fieldName === 'toggleLikePost'
        ? LikeTargetType.Post
        : info.fieldName === 'toggleLikeCommentLike'
        ? LikeTargetType.CommentLike
        : info.fieldName === 'toggleLikeCommentUnlike'
        ? LikeTargetType.CommentUnlike
        : null;

    if (!targetType) {
      throw new Error('Invalid target type by toggleLike');
    }

    if (args.like) {
      await this.likeService.createLikeLink(
        targetType,
        args.targetId,
        `${ctx.auth.id}`
      );
    } else {
      await this.likeService.deleteLikeLink(
        targetType,
        args.targetId,
        `${ctx.auth.id}`
      );
    }

    return true;
  }
}
