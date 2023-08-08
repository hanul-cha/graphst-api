import { FieldResolver, Inject, Query, Resolver } from 'graphst';
import { Post } from '../post.entity';
import { GraphQLBoolean, GraphQLID, GraphQLNonNull } from 'graphql';
import { PostService } from '../post.service';
import { CategoryService } from '../../category/category.service';
import { AuthContext } from '../../types';
import {
  GraphqlPaginate,
  PageOption,
  Paginate,
  graphqlPageInfo,
} from '../../utils/pagination';
import {
  GraphQLPostOrder,
  PostOrder,
  graphqlPostOptions,
  postOptions,
} from '../post.types';
import { Category } from '../../category/category.entity';

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
    return post;
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
