import {
  FieldResolver,
  Inject,
  Mutation,
  Query,
  Resolver,
  getObjectSchema,
} from 'graphst';
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { AuthContext, verifiedAuthContext } from '../types';
import {
  GraphqlPaginate,
  PageOption,
  graphqlPageInfo,
} from '../utils/pagination';
import { Comment } from './comment.entity';
import { Post } from '../post/post.entity';
import { CommentService } from './comment.service';
import { CommentOptions, graphqlCommentOptions } from './comment.types';
import { AuthGuardMiddleware } from '../auth/auth.guard.middleware';

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

  @FieldResolver({
    parent: () => Comment,
    returnType: () => GraphQLNonNull(GraphQLBoolean),
  })
  isMyComment(post: Comment, _: null, context: AuthContext): boolean {
    if (!context.auth) {
      return false;
    }
    return post.userId === `${context.auth.id}`;
  }

  @Query({
    args: {
      ...graphqlPageInfo(),
      ...graphqlCommentOptions,
    },
    returnType: () => GraphqlPaginate(Comment, 'comment'),
  })
  async comments(
    _: null,
    args: PageOption & CommentOptions,
    context: AuthContext
  ) {
    return this.commentService.commentPagination(args, context);
  }

  @Mutation({
    args: {
      postId: () => GraphQLNonNull(GraphQLString),
      contents: () => GraphQLNonNull(GraphQLString),
    },
    middlewares: [AuthGuardMiddleware],
    returnType: () => GraphQLNonNull(getObjectSchema(Comment)),
  })
  async createComment(
    _: null,
    args: {
      postId: string;
      contents: string;
    },
    context: verifiedAuthContext
  ): Promise<Comment> {
    return this.commentService.createComment(
      args.postId,
      args.contents,
      `${context.auth.id}`
    );
  }

  @Mutation({
    args: {
      commentId: () => GraphQLNonNull(GraphQLString),
    },
    middlewares: [AuthGuardMiddleware],
    returnType: () => GraphQLNonNull(GraphQLBoolean),
  })
  async deleteComment(
    _: null,
    args: {
      commentId: string;
    },
    context: verifiedAuthContext
  ): Promise<boolean> {
    await this.commentService.deleteComment(
      args.commentId,
      `${context.auth.id}`
    );
    return true;
  }
}
