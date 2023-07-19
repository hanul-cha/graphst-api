import {
  FieldResolver,
  Inject,
  Mutation,
  Query,
  Resolver,
  getObjectSchema,
} from 'graphst';
import { Post } from './post.entity';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { PostService } from './post.service';
import { CategoryService } from '../category/category.service';
import { AuthContext } from '../types';
import {
  GraphqlPaginate,
  PageOption,
  Paginate,
  graphqlPageInfo,
} from '../utils/pagination';
import {
  CreatePostProps,
  GraphQLPostOrder,
  PostOrder,
  graphqlPostOptions,
  postOptions,
} from './post.types';
import { Category } from '../category/category.entity';

/** @warring jwt middleware의 보호를 받지 않는 타입 */
@Resolver(() => Post)
export class PostResolver {
  @Inject(() => PostService)
  postService!: PostService;

  @Inject(() => CategoryService)
  categoryService!: CategoryService;

  @Query({
    args: {
      ...graphqlPageInfo(GraphQLPostOrder),
      ...graphqlPostOptions,
    },
    returnType: () => GraphqlPaginate(Post, 'post'),
  })
  async posts(
    _: null,
    args: PageOption<PostOrder> & postOptions,
    context: AuthContext
  ): Promise<Paginate<Post>> {
    return this.postService.postPagination(args, context);
  }

  @Query({
    args: {
      id: () => GraphQLNonNull(GraphQLID),
    },
    returnType: () => Post,
  })
  async getPost(_: null, args: { id: string }, context: AuthContext) {
    const post = await this.postService.getPostByIdLoader.load(args.id);

    if (
      post?.deleteAt ||
      (!post?.activeAt && post?.userId !== `${context.auth?.id}`)
    ) {
      return null;
    }
  }

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
    _: null,
    args: CreatePostProps,
    context: AuthContext
  ): Promise<Post> {
    return this.postService.createPost({
      ...args,
      userId: `${context.auth!.id}`,
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
    _: null,
    args: CreatePostProps & { postId: string },
    context: AuthContext
  ): Promise<Post> {
    return this.postService.updatePost({
      ...args,
      userId: `${context.auth!.id}`,
    });
  }

  @Mutation({
    args: {
      id: () => GraphQLNonNull(GraphQLID),
    },
    returnType: () => GraphQLNonNull(GraphQLBoolean),
  })
  async deletePost(_: null, args: { id: number }, context: AuthContext) {
    await this.postService.deletePost(`${args.id}`, `${context.auth!.id}`);
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
    _: null,
    args: { id: number; active: boolean },
    context: AuthContext
  ) {
    await this.postService.updateActiveAt(
      args.id,
      args.active,
      `${context.auth!.id}`
    );
    return true;
  }

  @FieldResolver({
    parent: () => Post,
    returnType: () => GraphQLNonNull(GraphQLBoolean),
  })
  activeAt(post: Post) {
    return !!post.activeAt;
  }

  @FieldResolver({
    parent: () => Post,
    returnType: () => Category,
  })
  async category(post: Post): Promise<Category | null> {
    if (!post.categoryId) {
      return null;
    }
    return this.categoryService.getCategoryByIdLoader.load(post.categoryId);
  }
}
