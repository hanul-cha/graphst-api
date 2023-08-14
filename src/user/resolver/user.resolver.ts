import {
  Args,
  FieldResolver,
  GraphstError,
  Inject,
  Mutation,
  Query,
  Resolver,
  getObjectSchema,
} from 'graphst';
import { User } from '../user.entity';
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { UserService, UserServiceError } from '../user.service';
import {
  AuthQuestion,
  GraphQLAuthQuestion,
  graphqlUsersOptions,
  UsersOptions,
} from '../user.types';
import { Post } from '../../post/post.entity';
import {
  graphqlPageInfo,
  GraphqlPaginate,
  PageOption,
  Paginate,
} from '../../utils/pagination';
import { Comment } from '../../comment/comment.entity';

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
    @Args()
    args: PageOption & UsersOptions
  ): Promise<Paginate<User>> {
    return this.userService.userPagination(args);
  }

  @Query({
    args: {
      id: () => GraphQLNonNull(GraphQLString),
    },
    returnType: () => User,
  })
  async getUserPublic(@Args() args: { id: string }): Promise<User | null> {
    return this.userService.getUserByUserIdLoader.load(+args.id);
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
    @Args()
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
      if (e instanceof UserServiceError) {
        throw new GraphstError(e.message, e.code);
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
    @Args()
    args: {
      id: string;
      password: string;
    }
  ): Promise<string> {
    return this.userService.signIn(args.id, args.password);
  }

  @Mutation({
    args: {
      userId: () => GraphQLNonNull(GraphQLString),
      password: () => GraphQLNonNull(GraphQLString),
    },
    returnType: () => GraphQLBoolean,
  })
  async changePassword(@Args() args: { userId: string; password: string }) {
    const { userId, password } = args;
    await this.userService.changePassword(userId, password);

    return true;
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
    @Args()
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
