import {
  Args,
  Inject,
  Mutation,
  Query,
  Resolver,
  getObjectSchema,
} from 'graphst';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { Category } from './category.entity';
import { CategoryService } from './category.service';
import { createRolesMiddleware } from '../user/user.middleware';
import { AuthRole } from '../user/user.types';

@Resolver({
  key: () => Category,
})
export class CategoryResolver {
  @Inject(() => CategoryService)
  categoryService!: CategoryService;

  @Query({
    returnType: () =>
      GraphQLNonNull(GraphQLList(GraphQLNonNull(getObjectSchema(Category)))),
  })
  async categories() {
    return this.categoryService.getAllCategories();
  }

  @Mutation({
    args: {
      id: () => GraphQLNonNull(GraphQLID),
    },
    middlewares: [createRolesMiddleware([AuthRole.MANAGER])],
    returnType: () => GraphQLNonNull(GraphQLBoolean),
  })
  async deleteCategory(@Args() args: { id: number }) {
    await this.categoryService.deleteCategory(`${args.id}`);
    return true;
  }

  @Mutation({
    args: {
      label: () => GraphQLNonNull(GraphQLString),
    },
    middlewares: [createRolesMiddleware([AuthRole.MANAGER])],
    returnType: () => GraphQLNonNull(GraphQLBoolean),
  })
  async addCategory(@Args() args: { label: string }) {
    await this.categoryService.addCategory(args.label);
    return true;
  }
}
