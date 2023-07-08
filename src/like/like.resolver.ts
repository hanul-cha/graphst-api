import { FieldResolver, Inject, Resolver } from 'graphst';
import { Like } from './like.entity';
import { LikeService } from './like.service';
import { User } from '../user/user.entity';
import { GraphQLInt, GraphQLNonNull } from 'graphql';
import { LikeTargetType } from './like.types';
import { Post } from '../post/post.entity';

@Resolver(() => Like)
export class LikeResolver {
  @Inject(() => LikeService)
  likeService!: LikeService;

  @FieldResolver({
    parent: () => User,
    returnType: () => GraphQLNonNull(GraphQLInt),
  })
  async countFollower(parent: User): Promise<number> {
    return this.likeService.countLikeByTarget(
      LikeTargetType.User,
      `${parent.id}`
    );
  }

  @FieldResolver({
    parent: () => User,
    returnType: () => GraphQLNonNull(GraphQLInt),
  })
  async countFollowing(parent: User): Promise<number> {
    return this.likeService.countLikeByUser(
      LikeTargetType.User,
      `${parent.id}`
    );
  }

  @FieldResolver({
    parent: () => Post,
    returnType: () => GraphQLNonNull(GraphQLInt),
    name: 'countLike',
  })
  async countLikeByPost(parent: Post): Promise<number> {
    return this.likeService.countLikeByTarget(
      LikeTargetType.User,
      `${parent.id}`
    );
  }
}
