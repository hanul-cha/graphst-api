import { Inject, Mutation, Query, Resolver, getObjectSchema } from 'graphst';
import { User } from '../user.entity';
import { GraphQLBoolean, GraphQLID, GraphQLNonNull } from 'graphql';
import { UserService } from '../user.service';
import { AuthRole } from '../user.types';
import { createRolesMiddleware } from '../user.middleware';
import { verifiedAuthContext } from '../../types';
import { AuthGuardMiddleware } from '../../auth/auth.guard.middleware';

@Resolver({
  key: () => User,
  middlewares: [AuthGuardMiddleware],
})
export class UserVerifiedResolver {
  @Inject(() => UserService)
  userService!: UserService;

  @Query({
    returnType: () => GraphQLNonNull(getObjectSchema(User)),
  })
  async getUser(_: null, __: null, context: verifiedAuthContext) {
    const user = await this.userService.getUserByUserIdLoader.load(
      context.auth.id
    );

    if (!user) {
      throw new Error('User not found');
    }
    return user;
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
}
