import { Inject, Injectable } from 'graphst';
import { DataSource } from 'typeorm';
import { PageOption, paginate } from '../utils/pagination';
import { AuthContext } from '../types';
import DataLoader from 'dataloader';

@Injectable()
export class CommentService {
  @Inject(() => DataSource)
  dataSource!: DataSource;

  getCountByPostIdLoader: DataLoader<string, number>;

  constructor() {
    this.getCountByPostIdLoader = new DataLoader(
      this._getCountByPostIds.bind(this),
      {
        cache: false,
      }
    );
  }

  async commentPagination(args?: PageOption, _context?: AuthContext) {
    const qb = this.dataSource
      .createEntityManager()
      .createQueryBuilder(Comment, 'Comment');

    return paginate(qb, args);
  }

  async _getCountByPostIds(ids: readonly string[]): Promise<number[]> {
    if (ids.length === 0) {
      return [];
    }
    const countComments = await this.dataSource
      .createEntityManager()
      .createQueryBuilder(Comment, 'Comment')
      .select(['Comment.post_id as postId', 'count(*) as count'])
      .andWhere('Comment.post_id IN (:...ids)', { ids: [...new Set(ids)] })
      .groupBy('Comment.post_id')
      .getRawMany<{ postId: string; count: string }>();

    return ids.map((id) => {
      const count = countComments.find(({ postId }) => postId === id)?.count;
      return count ? parseInt(count) : 0;
    });
  }
}
