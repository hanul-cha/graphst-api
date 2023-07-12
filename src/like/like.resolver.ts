import { FieldResolver, Inject, Mutation, Resolver } from 'graphst';
import { Like } from './like.entity';
import { LikeService } from './like.service';
import { User } from '../user/user.entity';
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { LikeTargetType } from './like.types';
import { Post } from '../post/post.entity';
import { AuthContext } from '../types';

@Resolver(() => Like)
export class LikeResolver {
  @Inject(() => LikeService)
  likeService!: LikeService;

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
    ctx: AuthContext,
    info: { fieldName: string }
  ) {
    const targetType =
      info.fieldName === 'toggleLikeUser'
        ? LikeTargetType.User
        : info.fieldName === 'toggleLikePost'
        ? LikeTargetType.Post
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

    return args.like;
  }

  @FieldResolver({
    parent: () => User,
    returnType: () => GraphQLNonNull(GraphQLInt),
  })
  async countFollower(parent: User): Promise<number> {
    return this.likeService.countLikeByTargetLoader.load({
      targetType: LikeTargetType.User,
      targetId: `${parent.id}`,
    });
  }

  @FieldResolver({
    parent: () => User,
    returnType: () => GraphQLNonNull(GraphQLInt),
  })
  async countFollowing(parent: User): Promise<number> {
    return this.likeService.countLikeByUserLoader.load({
      targetType: LikeTargetType.User,
      userId: `${parent.id}`,
    });
  }

  @FieldResolver({
    parent: () => Post,
    returnType: () => GraphQLNonNull(GraphQLInt),
    name: 'countLike',
  })
  async countLikeByPost(parent: Post): Promise<number> {
    return this.likeService.countLikeByTargetLoader.load({
      targetType: LikeTargetType.Post,
      targetId: `${parent.id}`,
    });
  }
}
