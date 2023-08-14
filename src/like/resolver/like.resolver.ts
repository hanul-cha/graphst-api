import { Context, FieldResolver, Inject, Parent, Resolver } from 'graphst';
import { Like } from '../like.entity';
import { LikeService } from '../like.service';
import { User } from '../../user/user.entity';
import { GraphQLBoolean, GraphQLInt, GraphQLNonNull } from 'graphql';
import { LikeTargetType } from '../like.types';
import { Post } from '../../post/post.entity';
import { AuthContext } from '../../types';
import { Comment } from '../../comment/comment.entity';

@Resolver(() => Like)
export class LikeResolver {
  @Inject(() => LikeService)
  likeService!: LikeService;

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

  @FieldResolver({
    parent: () => Comment,
    returnType: () => GraphQLNonNull(GraphQLInt),
    name: 'countLike',
  })
  async countLikeByComment(parent: Comment): Promise<number> {
    return this.likeService.countLikeByTargetLoader.load({
      targetType: LikeTargetType.CommentLike,
      targetId: `${parent.id}`,
    });
  }

  @FieldResolver({
    parent: () => Comment,
    returnType: () => GraphQLNonNull(GraphQLInt),
    name: 'countUnlike',
  })
  async countUnlikeByComment(parent: Comment): Promise<number> {
    return this.likeService.countLikeByTargetLoader.load({
      targetType: LikeTargetType.CommentUnlike,
      targetId: `${parent.id}`,
    });
  }

  @FieldResolver({
    parent: () => Post,
    returnType: () => GraphQLNonNull(GraphQLBoolean),
    name: 'isLike',
  })
  async isLikePostByUser(
    @Parent()
    parent: Post,
    @Context()
    context: AuthContext
  ): Promise<boolean> {
    if (!context?.auth) {
      return false;
    }
    return this.likeService.isLikeByUserIdLoader.load({
      targetType: LikeTargetType.Post,
      userId: `${context.auth.id}`,
      targetId: `${parent.id}`,
    });
  }

  @FieldResolver({
    parent: () => User,
    returnType: () => GraphQLNonNull(GraphQLBoolean),
    name: 'isLike',
  })
  async isLikeUserByUser(
    @Parent()
    parent: Post,
    @Context()
    context: AuthContext
  ): Promise<boolean> {
    if (!context?.auth) {
      return false;
    }
    return this.likeService.isLikeByUserIdLoader.load({
      targetType: LikeTargetType.User,
      userId: `${context.auth.id}`,
      targetId: `${parent.id}`,
    });
  }

  @FieldResolver({
    parent: () => Comment,
    returnType: () => GraphQLNonNull(GraphQLBoolean),
    name: 'isLike',
  })
  async isLikeUserByComment(
    @Parent()
    parent: Comment,
    @Context()
    context: AuthContext
  ): Promise<boolean> {
    if (!context?.auth) {
      return false;
    }
    return this.likeService.isLikeByUserIdLoader.load({
      targetType: LikeTargetType.CommentLike,
      userId: `${context.auth.id}`,
      targetId: `${parent.id}`,
    });
  }

  @FieldResolver({
    parent: () => Comment,
    returnType: () => GraphQLNonNull(GraphQLBoolean),
    name: 'isUnlike',
  })
  async isUnLikeUserByComment(
    @Parent()
    parent: Comment,
    @Context()
    context: AuthContext
  ): Promise<boolean> {
    if (!context?.auth) {
      return false;
    }
    return this.likeService.isLikeByUserIdLoader.load({
      targetType: LikeTargetType.CommentUnlike,
      userId: `${context.auth.id}`,
      targetId: `${parent.id}`,
    });
  }
}
