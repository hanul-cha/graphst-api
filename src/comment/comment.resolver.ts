import { FieldResolver, Inject, Query, Resolver } from 'graphst';
import { GraphQLInt, GraphQLNonNull } from 'graphql';
import { AuthContext } from '../types';
import {
  GraphqlPaginate,
  PageOption,
  graphqlPageInfo,
} from '../utils/pagination';
import { Comment } from './comment.entity';
import { Post } from '../post/post.entity';
import { CommentService } from './comment.service';

/** @warring jwt middleware의 보호를 받지 않는 타입 */
@Resolver(() => Comment)
export class CommentResolver {
  @Inject(() => CommentService)
  commentService!: CommentService;

  @FieldResolver({
    parent: () => Post,
    returnType: () => GraphQLNonNull(GraphQLInt),
  })
  countComment(post: Post) {
    return this.commentService.getCountByPostIdLoader.load(`${post.id}`);
  }

  @Query({
    args: {
      ...graphqlPageInfo,
    },
    returnType: () => GraphqlPaginate(Comment, 'comment'),
  })
  async comments(_: null, args: PageOption, context: AuthContext) {
    return this.commentService.commentPagination(args, context);
  }
}
