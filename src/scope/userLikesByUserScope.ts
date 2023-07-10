import { Brackets } from 'typeorm';
import { validateAlias } from '../utils/typeorm';
import { User } from '../user/user.entity';
import { Like } from '../like/like.entity';
import { LikeTargetType } from '../like/like.types';

export function userLikesByUserScope(targetId?: string, userId?: string) {
  return new Brackets((qb) => {
    if (!targetId && !userId) {
      throw new Error('targetId or userId must be provided');
    }
    if (validateAlias<User>(qb, 'User')) {
      const array = [];
      if (targetId) {
        array.push({ id: targetId, type: 'followerId' });
      }
      if (userId) {
        array.push({ id: userId, type: 'followingId' });
      }

      array.forEach(({ id, type }) => {
        const userIdSubQuery = qb
          .subQuery()
          .from(Like, 'Like')
          .where('Like.target_type = :targetType', {
            targetType: LikeTargetType.User,
          });

        if (type === 'followerId') {
          userIdSubQuery
            .select('Like.user_id')
            .andWhere('Like.target_id = :targetId', {
              targetId: id,
            });
        }
        if (type === 'followingId') {
          userIdSubQuery
            .select('Like.target_id')
            .andWhere('Like.user_id = :userId', {
              userId: id,
            });
        }
        qb.andWhere(`User.id IN ${userIdSubQuery.getQuery()}`);
      });
    } else {
      qb.andWhere('1 = 0');
    }
  });
}
