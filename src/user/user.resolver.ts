import { Inject, Mutation, Query, Resolver } from 'graphst';
import { User } from './user.entity';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  @Inject(() => UserService)
  userService!: UserService;

  @Query({
    args: {
      userId: () => GraphQLNonNull(GraphQLString),
      password: () => GraphQLNonNull(GraphQLString),
      name: () => GraphQLNonNull(GraphQLString),
      questionForSearch: () => GraphQLNonNull(GraphQLString),
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
      questionForSearch: string;
      answerForSearch: string;
    }
  ): Promise<User> {
    return this.userService.createUser(args);
  }

  @Query({
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
    returnType: () => GraphQLBoolean,
  })
  async deleteUser(_: null, args: { id: number }) {
    return this.userService.deleteUser(args.id);
  }
}
