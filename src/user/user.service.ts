import { Inject, Injectable } from 'graphst';
import { Brackets, DataSource, Like, SelectQueryBuilder } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { AuthQuestion, AuthRole, UsersOptions } from './user.types';
import { JwtService } from '../jwt/jwt.service';
import { PageOption, paginate } from '../utils/pagination';
import { LikeTargetType } from '../like/like.types';

@Injectable()
export class UserService {
  @Inject(() => DataSource)
  dataSource!: DataSource;

  @Inject(() => JwtService)
  jwtService!: JwtService;

  async userPagination(
    pageOptions?: PageOption | null,
    usersOptions?: UsersOptions
  ) {
    const qb = this.dataSource
      .createEntityManager()
      .createQueryBuilder(User, 'User');

    if (usersOptions?.followerId) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where((qb: SelectQueryBuilder<User>) => {
            const userIdSubQuery = qb
              .subQuery()
              .select('Like.user_id')
              .from(Like, 'Like')
              .where('Like.target_type = :targetType', {
                targetType: LikeTargetType.User,
              })
              .andWhere('Like.target_id = :targetId', {
                targetId: usersOptions.followerId,
              });

            qb.andWhere(`User.id IN ${userIdSubQuery.getQuery()}`);
          });
        })
      );
    }

    if (usersOptions?.followingId) {
      const userIdSubQuery = qb
        .subQuery()
        .select('Like.target_id')
        .from(Like, 'Like')
        .where('Like.target_type = :targetType', {
          targetType: LikeTargetType.User,
        })
        .andWhere('Like.user_id = :userId', {
          userId: usersOptions.followingId,
        });

      qb.andWhere(`User.id IN ${userIdSubQuery.getQuery()}`);
    }

    return paginate(qb, pageOptions);
  }

  async getUser(id: number): Promise<User> {
    return this.dataSource.manager.findOneOrFail(User, {
      where: {
        id,
      },
    });
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
