import { GraphstError, Inject, Injectable } from 'graphst';
import { DataSource, In } from 'typeorm';
import { Post } from './post.entity';
import DataLoader from 'dataloader';
import { CreatePostProps, postOptions } from './post.types';
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
    console.log([...new Set(ids)]);
    const posts = await this.dataSource.manager.find(Post, {
      where: {
        id: In([...new Set(ids)]),
      },
    });

    return ids.map((id) => posts.find((post) => `${post.id}` === id) || null);
  }

  async postPagination(
    pageOptions?: PageOption | null,
    postOptions?: postOptions,
    context?: AuthContext
  ) {
    const qb = this.dataSource
      .createEntityManager()
      .createQueryBuilder(Post, 'Post');

    qb.andWhere('Post.delete_at IS NULL');

    if (postOptions?.userId && context?.user?.id === postOptions.userId) {
      //
    } else {
      qb.andWhere('Post.active_at IS NOT NULL');
    }

    if (postOptions?.userId) {
      qb.andWhere('Post.user_id = :userId', {
        userId: postOptions.userId,
      });
    }

    if (postOptions?.likeUserId) {
      qb.andWhere(
        userLikesByUserScope(
          LikeTargetType.Post,
          undefined,
          postOptions?.likeUserId
        )
      );
    }

    return paginate(qb, pageOptions);
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
      throw new GraphstError('Not authorized');
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

  async updateActiveAt(id: number, active: boolean) {
    const post = await this.dataSource.manager.findOneOrFail(Post, {
      where: {
        id,
      },
    });

    if (!!post.activeAt === active) {
      throw new GraphstError('Already actioned');
    }

    post.activeAt = active ? new Date().getTime() : null;

    await this.dataSource.manager.save(post);
  }
}
