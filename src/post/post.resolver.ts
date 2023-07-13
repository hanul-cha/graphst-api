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
  GraphqlPageOptionInput,
  GraphqlPaginate,
  PageOption,
  Paginate,
} from '../utils/pagination';
import { CreatePostProps, GraphqlPostOptions, postOptions } from './post.types';
import { Category } from '../category/category.entity';

@Resolver(() => Post)
export class PostResolver {
  @Inject(() => PostService)
  postService!: PostService;

  @Inject(() => CategoryService)
  categoryService!: CategoryService;

  @Query({
    args: {
      pageOptions: () => GraphqlPageOptionInput,
      postOptions: () => GraphqlPostOptions,
    },
    returnType: () => GraphqlPaginate(Post, 'post'),
  })
  async posts(
    _: null,
    args: { pageOptions?: PageOption | null; postOptions?: postOptions },
    context: AuthContext
  ): Promise<Paginate<Post>> {
    return this.postService.postPagination(
      args.pageOptions,
      args.postOptions,
      context
    );
  }

  @Query({
    args: {
      id: () => GraphQLNonNull(GraphQLID),
    },
    returnType: () => Post,
  })
  async getPost(_: null, args: { id: number }) {
    return this.postService.getPostByUserIdLoader.load(args.id);
  }

  @Mutation({
    args: {
      title: () => GraphQLNonNull(GraphQLString),
      content: () => GraphQLNonNull(GraphQLString),
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
      userId: `${context.auth.id}`,
    });
  }

  @Mutation({
    args: {
      id: () => GraphQLNonNull(GraphQLID),
    },
    returnType: () => GraphQLNonNull(GraphQLBoolean),
  })
  async deletePost(_: null, args: { id: number }, context: AuthContext) {
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
  async updateActiveAt(_: null, args: { id: number; active: boolean }) {
    await this.postService.updateActiveAt(args.id, args.active);
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
