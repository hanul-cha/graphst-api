import { GraphstError, Inject, Injectable } from 'graphst';
import { DataSource, In } from 'typeorm';
import { Post } from './post.entity';
import DataLoader from 'dataloader';
import { CreatePostProps, postOptions } from './post.types';
import { PageOption, paginate } from '../utils/pagination';
import { userLikesByUserScope } from '../scope/userLikesByUserScope';
import { LikeTargetType } from '../like/like.types';

@Injectable()
export class PostService {
  @Inject(() => DataSource)
  dataSource!: DataSource;

  getPostByUserIdLoader: DataLoader<number, Post | null>;

  constructor() {
    this.getPostByUserIdLoader = new DataLoader(this._getPosts.bind(this), {
      cache: false,
    });
  }

  async _getPosts(ids: readonly number[]): Promise<(Post | null)[]> {
    const posts = await this.dataSource.manager.find(Post, {
      where: {
        id: In([...new Set(ids)]),
      },
    });

    return ids.map((id) => posts.find((post) => post.id === id) || null);
  }

  async postPagination(
    pageOptions?: PageOption | null,
    postOptions?: postOptions
  ) {
    const qb = this.dataSource
      .createEntityManager()
      .createQueryBuilder(Post, 'Post');

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
    return this.dataSource.manager.save(Post, {
      ...props,
      activeAt: props.activeAt ? new Date().getTime() : null,
      categoryId: props.categoryId || null,
    });
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
