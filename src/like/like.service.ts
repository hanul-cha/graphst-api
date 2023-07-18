import { Inject, Injectable } from 'graphst';
import { LikeTargetType } from './like.types';
import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { Like } from './like.entity';
import DataLoader from 'dataloader';

interface CountLikeByUserLoaderKey {
  targetType: LikeTargetType;
  userId: string;
}

interface CountLikeByTargetLoaderKey {
  targetType: LikeTargetType;
  targetId: string;
}

interface IsLikeByUserIdLoaderKey extends CountLikeByTargetLoaderKey {
  userId: string;
}

@Injectable()
export class LikeService {
  @Inject(() => DataSource)
  dataSource!: DataSource;

  countLikeByUserLoader: DataLoader<CountLikeByUserLoaderKey, number>;
  countLikeByTargetLoader: DataLoader<CountLikeByTargetLoaderKey, number>;
  isLikeByUserIdLoader: DataLoader<IsLikeByUserIdLoaderKey, boolean>;

  constructor() {
    this.countLikeByUserLoader = new DataLoader(
      this._countLikeByUser.bind(this),
      { cache: false }
    );
    this.countLikeByTargetLoader = new DataLoader(
      this._countLikeByTarget.bind(this),
      { cache: false }
    );
    this.isLikeByUserIdLoader = new DataLoader(
      this._isLikeByUserId.bind(this),
      { cache: false }
    );
  }

  async _isLikeByUserId(
    keys: readonly IsLikeByUserIdLoaderKey[]
  ): Promise<boolean[]> {
    if (keys.length === 0) {
      return [];
    }

    const targetTypes = new Set(keys.map((key) => key.targetType));
    const targetIds = new Set(keys.map((key) => key.targetId));
    const userIds = new Set(keys.map((key) => key.userId));

    const qb = this.dataSource
      .createEntityManager()
      .createQueryBuilder(Like, 'Like')
      .select([
        'Like.target_type as targetType',
        'Like.target_id as targetId',
        'Like.user_id as userId',
        'count(*) as count',
      ])
      .andWhere('Like.target_type IN (:...targetTypes)', {
        targetTypes: [...targetTypes],
      })
      .andWhere('Like.target_id IN (:...targetIds)', {
        targetIds: [...targetIds],
      })
      .andWhere('Like.user_id IN (:...userIds)', {
        userIds: [...userIds],
      })
      .groupBy('Like.target_type, Like.target_id, Like.user_id');

    const countMap = new Map<string, number>();

    await qb
      .getRawMany<{
        targetType: LikeTargetType;
        targetId: string;
        userId: string;
        count: number;
      }>()
      .then((rows) => {
        rows.forEach(({ targetType, targetId, count, userId }) => {
          if (count > 0) {
            countMap.set(`${targetType}-${targetId}-${userId}`, count);
          }
        });
      });

    return keys.map(({ targetType, targetId, userId }) => {
      return !!countMap.get(`${targetType}-${targetId}-${userId}`);
    });
  }

  async _countLikeByUser(
    keys: readonly CountLikeByUserLoaderKey[]
  ): Promise<number[]> {
    if (keys.length === 0) {
      return [];
    }

    const targetTypes = new Set(keys.map((key) => key.targetType));
    const userIds = new Set(keys.map((key) => key.userId));

    const qb = this.dataSource
      .createEntityManager()
      .createQueryBuilder(Like, 'Like')
      .select([
        'Like.target_type as targetType',
        'Like.user_id as userId',
        'count(*) as count',
      ])
      .andWhere('Like.target_type IN (:...targetTypes)', {
        targetTypes: [...targetTypes],
      })
      .andWhere('Like.user_id IN (:...userIds)', {
        userIds: [...userIds],
      })
      .groupBy('Like.target_type, Like.user_id');

    const countMap = new Map<string, number>();

    await qb
      .getRawMany<{
        targetType: LikeTargetType;
        userId: string;
        count: number;
      }>()
      .then((rows) => {
        rows.forEach(({ targetType, userId, count }) => {
          countMap.set(`${targetType}-${userId}`, count);
        });
      });

    return keys.map(({ targetType, userId }) => {
      return countMap.get(`${targetType}-${userId}`) || 0;
    });
  }

  async _countLikeByTarget(
    keys: readonly CountLikeByTargetLoaderKey[]
  ): Promise<number[]> {
    if (keys.length === 0) {
      return [];
    }

    const targetTypes = new Set(keys.map((key) => key.targetType));
    const targetIds = new Set(keys.map((key) => key.targetId));

    const qb = this.dataSource
      .createEntityManager()
      .createQueryBuilder(Like, 'Like')
      .select([
        'Like.target_type as targetType',
        'Like.target_id as targetId',
        'count(*) as count',
      ])
      .andWhere('Like.target_type IN (:...targetTypes)', {
        targetTypes: [...targetTypes],
      })
      .andWhere('Like.target_id IN (:...targetIds)', {
        targetIds: [...targetIds],
      })
      .groupBy('Like.target_type, Like.target_id');

    const countMap = new Map<string, number>();

    await qb
      .getRawMany<{
        targetType: LikeTargetType;
        targetId: string;
        count: number;
      }>()
      .then((rows) => {
        rows.forEach(({ targetType, targetId, count }) => {
          countMap.set(`${targetType}-${targetId}`, count);
        });
      });

    return keys.map(({ targetType, targetId }) => {
      return countMap.get(`${targetType}-${targetId}`) || 0;
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
