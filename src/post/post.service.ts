import { Inject, Injectable } from 'graphst';
import { DataSource } from 'typeorm';
import { Post } from './post.entity';

@Injectable()
export class PostService {
  @Inject(() => DataSource)
  dataSource!: DataSource;

  async getPost(id: number): Promise<Post | null> {
    return this.dataSource.manager.findOne(Post, {
      where: {
        id,
      },
    });
  }
}
