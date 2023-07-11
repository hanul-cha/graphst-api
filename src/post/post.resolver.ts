import { Inject, Query, Resolver, getObjectSchema } from 'graphst';
import { Post } from './post.entity';
import { GraphQLID, GraphQLNonNull } from 'graphql';
import { PostService } from './post.service';

@Resolver(() => Post)
export class PostResolver {
  @Inject(() => PostService)
  postService!: PostService;

  @Query({
    args: {
      id: () => GraphQLNonNull(GraphQLID),
    },
    returnType: () => GraphQLNonNull(getObjectSchema(Post)),
  })
  async getPost(_: null, args: { id: number }) {
    return this.postService.getPost(args.id);
  }
}
