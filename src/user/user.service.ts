import { Inject, Injectable } from 'graphst';
import { DataSource, In } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { AuthQuestion, AuthRole, UsersOptions } from './user.types';
import { JwtService } from '../jwt/jwt.service';
import { PageOption, paginate } from '../utils/pagination';
import { userLikesByUserScope } from '../scope/userLikesByUserScope';
import DataLoader from 'dataloader';
import { LikeTargetType } from '../like/like.types';
import { Post } from '../post/post.entity';

@Injectable()
export class UserService {
  @Inject(() => DataSource)
  dataSource!: DataSource;

  @Inject(() => JwtService)
  jwtService!: JwtService;

  getUserByUserIdLoader: DataLoader<number, User | null>;
  getCountPostByUserIdLoader: DataLoader<number, number>;

  constructor() {
    this.getUserByUserIdLoader = new DataLoader(this._getUsers.bind(this), {
      cache: false,
    });
    this.getCountPostByUserIdLoader = new DataLoader(
      this._getCountPost.bind(this),
      {
        cache: false,
      }
    );
  }

  async _getCountPost(ids: readonly number[]): Promise<number[]> {
    if (ids.length === 0) {
      return [];
    }
    const countPosts = await this.dataSource
      .createEntityManager()
      .createQueryBuilder(Post, 'Post')
      .select(['Post.user_id as userId', 'count(*) as count'])
      .andWhere('Post.delete_at IS NULL')
      .andWhere('Post.active_at IS NOT NULL')
      .andWhere('Post.user_id IN (:...ids)', { ids: [...new Set(ids)] })
      .groupBy('Post.user_id')
      .getRawMany<{ userId: string; count: string }>();

    return ids.map((id) => {
      const count = countPosts.find(({ userId }) => userId === `${id}`)?.count;
      return count ? parseInt(count) : 0;
    });
  }

  async _getUsers(ids: readonly number[]): Promise<(User | null)[]> {
    const users = await this.dataSource.manager.find(User, {
      where: {
        id: In([...new Set(ids)]),
      },
    });

    return ids.map((id) => users.find((user) => user.id === id) || null);
  }

  async userPagination(args: PageOption & UsersOptions) {
    const qb = this.dataSource
      .createEntityManager()
      .createQueryBuilder(User, 'User');

    if (args?.followerId || args?.followingId) {
      qb.andWhere(
        userLikesByUserScope(
          LikeTargetType.User,
          args.followerId,
          args.followingId
        )
      );
    }

    if (args?.likePostId) {
      qb.andWhere(userLikesByUserScope(LikeTargetType.Post, args?.likePostId));
    }

    return paginate(qb, args);
  }

  async validateQuestion(
    userId: string,
    questionForSearch: AuthQuestion,
    answerForSearch: string
  ): Promise<boolean> {
    const user = await this.dataSource.manager.findOne(User, {
      where: {
        userId,
      },
    });

    if (!user) {
      return false;
    }

    if (user.questionForSearch !== questionForSearch) {
      return false;
    }

    if (user.answerForSearch !== answerForSearch) {
      return false;
    }

    return true;
  }

  async createPassword(password: string) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  }

  async changePassword(userId: string, password: string): Promise<User> {
    const user = await this.dataSource.manager.findOne(User, {
      where: {
        userId,
      },
    });

    if (!user) {
      throw new Error('존재하지 않는 유저입니다.');
    }

    user.password = await this.createPassword(password);

    await this.dataSource.manager.save(user);

    return user;
  }

  async createUser(input: {
    userId: string;
    password: string;
    name: string;
    questionForSearch: AuthQuestion;
    answerForSearch: string;
  }): Promise<User> {
    const user = this.dataSource.manager.create(User, {
      ...input,
      password: await this.createPassword(input.password),
      roles: [AuthRole.USER],
    });

    try {
      await this.dataSource.manager.save(user);
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error('이미 사용중인 아이디 입니다.');
      } else {
        throw new Error(err);
      }
    }

    return user;
  }

  async signIn(id: string, password: string): Promise<string> {
    const user = await this.dataSource.manager.findOne(User, {
      where: {
        userId: id,
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { id: user.id, roles: user.roles, name: user.name };
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '1d',
      });
      return accessToken;
    } else {
      throw new Error('아이디 또는 비밀번호를 확인해주세요.');
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = await this.dataSource.manager.findOne(User, {
      where: { id },
    });
    if (!user) {
      throw new Error('User not found');
    }
    await user.remove();
    return true;
  }
}
