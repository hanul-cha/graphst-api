import { Inject, Injectable } from 'graphst';
import { LikeTargetType } from './like.types';
import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { Like } from './like.entity';

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

  async getLike(targetType: LikeTargetType, targetId: string, userId: string) {
    return this.dataSource.manager.findOne(Like, {
      where: {
        targetType,
        targetId,
        userId,
      },
    });
  }

  async createLikeLink(
    targetType: LikeTargetType,
    targetId: string,
    userId: string
  ) {
    const like = await this.getLike(targetType, targetId, userId);
    if (like) {
      throw new Error('Already liked');
    }

    return this.dataSource.manager.save(
      this.dataSource.manager.create(Like, {
        targetType,
        targetId,
        userId,
      })
    );
  }

  async deleteLikeLink(
    targetType: LikeTargetType,
    targetId: string,
    userId: string
  ) {
    const like = await this.getLike(targetType, targetId, userId);

    if (!like) {
      throw new Error('Not liked');
    }
    await this.dataSource.manager.remove(like);

    return true;
  }
}
