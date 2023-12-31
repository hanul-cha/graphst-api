import {
  Args,
  Context,
  Inject,
  Mutation,
  Resolver,
  getObjectSchema,
} from 'graphst';
import { Post } from '../post.entity';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { PostService } from '../post.service';
import { CategoryService } from '../../category/category.service';
import { VerifiedAuthContext } from '../../types';
import { CreatePostProps } from '../post.types';
import { AuthGuardMiddleware } from '../../auth/auth.guard.middleware';

@Resolver({
  key: () => Post,
  middlewares: [AuthGuardMiddleware],
})
export class PostVerifiedResolver {
  @Inject(() => PostService)
  postService!: PostService;

  @Inject(() => CategoryService)
  categoryService!: CategoryService;

  @Mutation({
    args: {
      title: () => GraphQLNonNull(GraphQLString),
      contents: () => GraphQLNonNull(GraphQLString),
      categoryId: () => GraphQLString,
      activeAt: () => GraphQLBoolean,
    },
    returnType: () => GraphQLNonNull(getObjectSchema(Post)),
  })
  async createPost(
    @Args()
    args: CreatePostProps,
    @Context()
    context: VerifiedAuthContext
  ): Promise<Post> {
    return this.postService.createPost({
      ...args,
      userId: `${context.auth.id}`,
    });
  }

  @Mutation({
    args: {
      title: () => GraphQLNonNull(GraphQLString),
      contents: () => GraphQLNonNull(GraphQLString),
      categoryId: () => GraphQLString,
      activeAt: () => GraphQLBoolean,
      postId: () => GraphQLNonNull(GraphQLID),
    },
    returnType: () => GraphQLNonNull(getObjectSchema(Post)),
  })
  async updatePost(
    @Args()
    args: CreatePostProps & { postId: string },
    @Context()
    context: VerifiedAuthContext
  ): Promise<Post> {
    return this.postService.updatePost({
      ...args,
      userId: `${context.auth.id}`,
    });
  }

  @Mutation({
    args: {
      id: () => GraphQLNonNull(GraphQLID),
    },
    returnType: () => GraphQLNonNull(GraphQLBoolean),
  })
  async deletePost(
    @Args()
    args: { id: number },
    @Context()
    context: VerifiedAuthContext
  ) {
    await this.postService.deletePost(`${args.id}`, `${context.auth.id}`);
    return true;
  }

  @Mutation({
    args: {
      id: () => GraphQLNonNull(GraphQLID),
      active: () => GraphQLNonNull(GraphQLBoolean),
    },
    returnType: () => GraphQLNonNull(GraphQLBoolean),
  })
  async updateActiveAt(
    @Args()
    args: { id: number; active: boolean },
    @Context()
    context: VerifiedAuthContext
  ) {
    await this.postService.updateActiveAt(
      args.id,
      args.active,
      `${context.auth.id}`
    );
    return true;
  }
}
