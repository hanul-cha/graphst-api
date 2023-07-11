import { Inject, Injectable } from 'graphst';
import { DataSource } from 'typeorm';
import { Post } from './post.entity';

@Injectable()
export class PostService {
  @Inject(() => DataSource)
  dataSource!: DataSource;

  async getPost(id: number): Promise<Post> {
    return this.dataSource.manager.findOneOrFail(Post, {
      where: {
        id,
      },
    });
  }
}
