import { Inject, Injectable } from 'graphst';
import { LikeTargetType } from './like.types';
import { DataSource, Like } from 'typeorm';
import { User } from '../user/user.entity';

// TODO: dataloader
@Injectable()
export class LikeService {
  @Inject(() => DataSource)
  dataSource!: DataSource;

  async countLikeByUser(targetType: LikeTargetType, userId: string) {
    return this.dataSource.manager.count(Like, {
      where: {
        targetType,
        userId,
      },
    });
  }

  async countLikeByTarget(targetType: LikeTargetType, targetId: string) {
    return this.dataSource.manager.count(Like, {
      where: {
        targetType,
        targetId,
      },
    });
  }

  async likeUsers(targetType: LikeTargetType, targetId: string) {
    const qb = this.dataSource
      .createEntityManager()
      .createQueryBuilder(User, 'User');
    return qb
      .innerJoin(Like, 'Like', 'Like.userId = User.id')
      .where('Like.targetType = :targetType', { targetType })
      .andWhere('Like.targetId = :targetId', { targetId })
      .select('User')
      .getMany();
  }
}
