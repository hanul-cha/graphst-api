import {
  FieldResolver,
  GraphstError,
  Inject,
  Mutation,
  Query,
  Resolver,
  getObjectSchema,
} from 'graphst';
import { User } from './user.entity';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { UserService } from './user.service';
import {
  AuthQuestion,
  AuthRole,
  GraphQLAuthQuestion,
  graphqlUsersOptions,
  UsersOptions,
} from './user.types';
import { createRolesMiddleware } from './user.middleware';
import { AuthContext } from '../types';
import { Post } from '../post/post.entity';
import {
  graphqlPageInfo,
  GraphqlPaginate,
  PageOption,
  Paginate,
} from '../utils/pagination';
import { Comment } from '../comment/comment.entity';

@Resolver(() => User)
export class UserResolver {
  @Inject(() => UserService)
  userService!: UserService;

  @Query({
    args: {
      ...graphqlPageInfo(),
      ...graphqlUsersOptions,
    },
    returnType: () => GraphqlPaginate(User, 'user'),
  })
  async users(
    _: null,
    args: PageOption & UsersOptions
  ): Promise<Paginate<User>> {
    return this.userService.userPagination(args);
  }

  @Query({
    returnType: () => GraphQLNonNull(getObjectSchema(User)),
  })
  async getUser(_: null, __: null, context: AuthContext) {
    const user = await this.userService.getUserByUserIdLoader.load(
      context.auth!.id
    );

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Query({
    args: {
      id: () => GraphQLNonNull(GraphQLString),
    },
    returnType: () => User,
  })
  async getUserPublic(_: null, args: { id: string }): Promise<User | null> {
    return this.userService.getUserByUserIdLoader.load(+args.id);
  }

  @Mutation({
    args: {
      userId: () => GraphQLNonNull(GraphQLString),
      questionForSearch: () => GraphQLNonNull(GraphQLAuthQuestion),
      answerForSearch: () => GraphQLNonNull(GraphQLString),
    },
    returnType: () => GraphQLBoolean,
  })
  async validateQuestion(
    _: null,
    args: {
      userId: string;
      questionForSearch: AuthQuestion;
      answerForSearch: string;
    }
  ): Promise<boolean> {
    const { userId, questionForSearch, answerForSearch } = args;

    return this.userService.validateQuestion(
      userId,
      questionForSearch,
      answerForSearch
    );
  }

  @Mutation({
    args: {
      userId: () => GraphQLNonNull(GraphQLString),
      password: () => GraphQLNonNull(GraphQLString),
    },
    returnType: () => GraphQLBoolean,
  })
  async changePassword(_: null, args: { userId: string; password: string }) {
    const { userId, password } = args;
    await this.userService.changePassword(userId, password);

    return true;
  }

  @Mutation({
    args: {
      userId: () => GraphQLNonNull(GraphQLString),
      password: () => GraphQLNonNull(GraphQLString),
      name: () => GraphQLNonNull(GraphQLString),
      questionForSearch: () => GraphQLNonNull(GraphQLAuthQuestion),
      answerForSearch: () => GraphQLNonNull(GraphQLString),
    },
    returnType: () => User,
  })
  async signUp(
    _: null,
    args: {
      userId: string;
      password: string;
      name: string;
      questionForSearch: AuthQuestion;
      answerForSearch: string;
    }
  ): Promise<User> {
    try {
      return await this.userService.createUser(args);
    } catch (e: any) {
      if (e.message === '이미 사용중인 아이디 입니다.') {
        throw new GraphstError('이미 사용중인 아이디 입니다.', 'DUP_ID');
      }
      throw new Error(e);
    }
  }

  @Mutation({
    args: {
      id: () => GraphQLNonNull(GraphQLString),
      password: () => GraphQLNonNull(GraphQLString),
    },
    returnType: () => GraphQLString,
  })
  async signIn(
    _: null,
    args: {
      id: string;
      password: string;
    }
  ): Promise<string> {
    return this.userService.signIn(args.id, args.password);
  }

  @Mutation({
    args: {
      id: () => GraphQLNonNull(GraphQLID),
    },
    middlewares: [createRolesMiddleware([AuthRole.DEVELOPER])],
    returnType: () => GraphQLBoolean,
  })
  async deleteUser(_: null, args: { id: number }) {
    return this.userService.deleteUser(args.id);
  }

  @FieldResolver({
    parent: () => User,
    returnType: () => GraphQLNonNull(GraphQLInt),
  })
  async countPost(parent: User): Promise<number> {
    return this.userService.getCountPostByUserIdLoader.load(parent.id);
  }

  @FieldResolver({
    parent: () => Post,
    returnType: () => GraphQLNonNull(getObjectSchema(User)),
    name: 'user',
  })
  @FieldResolver({
    parent: () => Comment,
    returnType: () => GraphQLNonNull(getObjectSchema(User)),
    name: 'user',
  })
  async userByUserId(parent: Post | Comment): Promise<User> {
    const user = await this.userService.getUserByUserIdLoader.load(
      +parent.userId
    );

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
