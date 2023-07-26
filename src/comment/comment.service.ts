import { GraphstError, Inject, Injectable } from 'graphst';
import { DataSource, EntityManager } from 'typeorm';
import { PageOption, paginate } from '../utils/pagination';
import { AuthContext } from '../types';
import DataLoader from 'dataloader';
import { CommentOptions } from './comment.types';
import { Comment } from './comment.entity';
import { Post } from '../post/post.entity';

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

  async commentPagination(
    args?: PageOption & CommentOptions,
    _context?: AuthContext
  ) {
    const qb = this.dataSource
      .createEntityManager()
      .createQueryBuilder(Comment, 'Comment');

    if (args?.postId) {
      qb.andWhere('Comment.post_id = :postId', {
        postId: args.postId,
      });
    }

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

  async createComment(postId: string, contents: string, userId: string) {
    return this.dataSource.manager.transaction(async (manager) => {
      const commentRepository = manager.getRepository(Comment);
      const comment = await commentRepository.save(
        commentRepository.create({
          userId,
          postId,
          contents,
        })
      );
      await this.updatePostCommentCount(comment.postId, 1, manager);
      return comment;
    });
  }

  async deleteComment(id: string, userId: string) {
    return this.dataSource.manager.transaction(async (manager) => {
      const commentRepository = manager.getRepository(Comment);
      const comment = await commentRepository.findOneOrFail({
        where: {
          id: +id,
        },
      });
      if (comment.userId !== userId) {
        throw new GraphstError('권한이 없습니다.');
      }
      await commentRepository.remove(comment);
      await this.updatePostCommentCount(comment.postId, -1, manager);
    });
  }

  async updatePostCommentCount(
    postId: string,
    count: number,
    manager: EntityManager
  ) {
    const postRepository = manager.getRepository(Post);
    const post = await postRepository.findOneOrFail({
      where: {
        id: +postId,
      },
    });
    post._countComment += count;
    await postRepository.save(post);
  }
}
