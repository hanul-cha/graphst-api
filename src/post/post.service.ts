import { GraphstError, Inject, Injectable } from 'graphst';
import { DataSource, In } from 'typeorm';
import { Post } from './post.entity';
import DataLoader from 'dataloader';

export interface CreatePostProps {
  userId: string;
  title: string;
  content: string;
  categoryId?: string;
  activeAt?: boolean;
}

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

  async _getPosts(ids: readonly number[]): Promise<(Post | null)[]> {
    const posts = await this.dataSource.manager.find(Post, {
      where: {
        id: In([...new Set(ids)]),
      },
    });

    return ids.map((id) => posts.find((post) => post.id === id) || null);
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
