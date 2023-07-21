import { GraphstError, Inject, Injectable } from 'graphst';
import { Brackets, DataSource, In } from 'typeorm';
import { Post } from './post.entity';
import DataLoader from 'dataloader';
import { CreatePostProps, PostOrder, postOptions } from './post.types';
import { PageOption, paginate } from '../utils/pagination';
import { userLikesByUserScope } from '../scope/userLikesByUserScope';
import { LikeTargetType } from '../like/like.types';
import { AuthContext } from '../types';

@Injectable()
export class PostService {
  @Inject(() => DataSource)
  dataSource!: DataSource;

  getPostByIdLoader: DataLoader<string, Post | null>;

  constructor() {
    this.getPostByIdLoader = new DataLoader(this._getPosts.bind(this), {
      cache: false,
    });
  }

  async _getPosts(ids: readonly string[]): Promise<(Post | null)[]> {
    const posts = await this.dataSource.manager.find(Post, {
      where: {
        id: In([...new Set(ids)]),
      },
    });

    return ids.map((id) => posts.find((post) => `${post.id}` === id) || null);
  }

  async postPagination(
    args?: PageOption<PostOrder> & postOptions,
    context?: AuthContext
  ) {
    const qb = this.dataSource
      .createEntityManager()
      .createQueryBuilder(Post, 'Post');

    qb.andWhere('Post.delete_at IS NULL');

    if (args?.query) {
      qb.andWhere('Post.title LIKE :query', {
        query: `%${args.query}%`,
      });
    }

    if (args?.categoryId) {
      qb.andWhere('Post.category_id = :categoryId', {
        categoryId: args.categoryId,
      });
    }

    if (context?.auth?.id) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.orWhere('Post.active_at IS NOT NULL');
          qb.orWhere('Post.active_at IS NULL AND Post.user_id = :authId', {
            authId: context?.auth?.id,
          });
        })
      );
    } else {
      qb.andWhere('Post.active_at IS NOT NULL');
    }

    if (args?.userId) {
      qb.andWhere('Post.user_id = :userId', {
        userId: args.userId,
      });
    }

    if (args?.likeUserId) {
      qb.andWhere(
        userLikesByUserScope(LikeTargetType.Post, undefined, args?.likeUserId)
      );
    }

    let column = '';

    if (args?.order) {
      if (args.order === PostOrder.FOLLOWER) {
        column = 'Post._count_like';
      } else if (args.order === PostOrder.TITLE) {
        column = 'Post.title';
      }
    }

    return paginate(
      qb,
      args?.order
        ? {
            ...args,
            order: column,
          }
        : args
    );
  }

  async createPost(props: CreatePostProps): Promise<Post> {
    const post = await this.dataSource.manager.findOne(Post, {
      where: {
        title: props.title,
      },
    });

    if (post) {
      throw new GraphstError('Duplicate title');
    }
    return this.dataSource.manager.save(Post, {
      ...props,
      activeAt: props.activeAt ? new Date().getTime() : null,
      categoryId: props.categoryId || null,
    });
  }

  async updatePost({
    postId,
    title,
    contents,
    userId,
    activeAt,
    categoryId,
  }: CreatePostProps & { postId: string }): Promise<Post> {
    const dupPost = await this.dataSource.manager.findOne(Post, {
      where: {
        title,
      },
    });

    if (dupPost && `${dupPost.id}` !== postId) {
      throw new GraphstError('Duplicate title');
    }

    const post = await this.dataSource.manager.findOneOrFail(Post, {
      where: {
        id: +postId,
      },
    });

    if (userId !== `${post.id}`) {
      throw new GraphstError('Only the author can edit');
    }

    post.title = title;
    post.contents = contents;
    post.activeAt =
      !!post.activeAt === !!activeAt
        ? post.activeAt
        : activeAt
        ? new Date().getTime()
        : null;
    post.categoryId = categoryId ?? null;

    return this.dataSource.manager.save(post);
  }

  async deletePost(id: string, userId: string) {
    const post = await this.dataSource.manager.findOneOrFail(Post, {
      where: {
        id: +id,
      },
    });

    if (post.userId !== userId) {
      throw new GraphstError('Not authorized');
    }

    post.deleteAt = new Date().getTime();

    await this.dataSource.manager.save(post);
  }

  async updateActiveAt(id: number, active: boolean, userId: string) {
    const post = await this.dataSource.manager.findOneOrFail(Post, {
      where: {
        id,
      },
    });

    if (post.userId !== userId) {
      throw new GraphstError('Only the author can edit');
    }

    if (!!post.activeAt === active) {
      throw new GraphstError('Already actioned');
    }

    post.activeAt = active ? new Date().getTime() : null;

    await this.dataSource.manager.save(post);
  }
}
