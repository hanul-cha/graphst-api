import {
  FieldResolver,
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
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { UserService } from './user.service';
import {
  AuthQuestion,
  AuthRole,
  GraphQLAuthQuestion,
  GraphqlUsersOptions,
  UsersOptions,
} from './user.types';
import { createRolesMiddleware } from './user.middleware';
import { AuthContext } from '../types';
import { Post } from '../post/post.entity';
import {
  GraphqlPageOptionInput,
  GraphqlPaginate,
  PageOption,
  Paginate,
} from '../utils/pagination';

@Resolver(() => User)
export class UserResolver {
  @Inject(() => UserService)
  userService!: UserService;

  @Query({
    args: {
      pageOptions: () => GraphqlPageOptionInput,
      userOptions: () => GraphqlUsersOptions,
    },
    returnType: () => GraphqlPaginate(User, 'user'),
  })
  async users(
    _: null,
    args: { pageOptions?: PageOption | null; userOptions?: UsersOptions }
  ): Promise<Paginate<User>> {
    return this.userService.userPagination(args.pageOptions, args.userOptions);
  }

  @Query({
    returnType: () => GraphQLNonNull(getObjectSchema(User)),
  })
  async getUser(_: null, __: null, context: AuthContext) {
    return this.userService.getUser(context.auth.id);
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
    return this.userService.createUser(args);
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
    parent: () => Post,
    returnType: () => GraphQLNonNull(getObjectSchema(User)),
    name: 'user',
  })
  async userByPost(parent: Post): Promise<User> {
    return this.userService.getUser(+parent.userId);
  }
}
