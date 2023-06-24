import { Inject, Injectable } from 'graphst';
import { DataSource } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { AuthRole } from './types';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class UserService {
  @Inject(() => DataSource)
  dataSource!: DataSource;

  @Inject(() => JwtService)
  jwtService!: JwtService;

  async createUser(input: {
    userId: string;
    password: string;
    name: string;
    questionForSearch: string;
    answerForSearch: string;
  }): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(input.password, salt);

    const user = this.dataSource.manager.create(User, {
      ...input,
      password: hashedPassword,
      roles: [AuthRole.ADMIN_USER],
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
