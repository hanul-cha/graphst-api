import { FieldResolver, Inject, Mutation, Query, Resolver } from 'graphst';
import { Post } from './post.entity';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { PostService } from './post.service';
import { CategoryService } from '../category/category.service';

@Resolver(() => Post)
export class PostResolver {
  @Inject(() => PostService)
  postService!: PostService;

  @Inject(() => CategoryService)
  categoryService!: CategoryService;

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
    returnType: () => GraphQLString,
  })
  async category(post: Post): Promise<string | null> {
    if (!post.categoryId) {
      return null;
    }
    return this.categoryService.getCategoryLabelByIdLoader.load(
      post.categoryId
    );
  }
}
