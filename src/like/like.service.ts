import { Inject, Injectable } from 'graphst';
import { LikeTargetType } from './like.types';
import { DataSource, Like } from 'typeorm';

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
}
