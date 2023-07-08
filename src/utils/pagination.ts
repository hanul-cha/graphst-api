import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { getObjectSchema } from 'graphst';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export interface PageInfo {
  hasNextPage: boolean;
  startPath: string;
  endPath: string;
}

export const GraphqlPageInfo = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    hasNextPage: { type: GraphQLNonNull(GraphQLBoolean) },
    startPath: { type: GraphQLNonNull(GraphQLString) },
    endPath: { type: GraphQLNonNull(GraphQLString) },
  },
});

export interface PageOption {
  perPage?: number;
  page?: number;
  after?: string | null;
  order?: { column: string; asc: boolean };
}

export interface Paginate<TEntity extends ObjectLiteral> {
  totalCount: number;
  nodes: TEntity[];
  pageInfo: PageInfo;
}

export function GraphqlPaginate<o extends Function>(type: o, name: string) {
  return new GraphQLObjectType({
    name: name + 'Paginate',
    fields: {
      totalCount: { type: GraphQLNonNull(GraphQLInt) },
      nodes: {
        type: GraphQLNonNull(
          GraphQLList(GraphQLNonNull(getObjectSchema(type)))
        ),
      },
      pageInfo: { type: GraphQLNonNull(GraphqlPageInfo) },
    },
  });
}

export async function paginate<TEntity extends ObjectLiteral>(
  qb: SelectQueryBuilder<TEntity>,
  option: PageOption
): Promise<Paginate<TEntity>> {
  const totalCount = await qb.clone().getCount();

  const perPage = Math.min(option.perPage ?? 20, 100);
  const page = Math.min(option.page ?? 1);
  const nodeQuery = qb.clone();

  const nodes = await nodeQuery
    .take(perPage)
    .skip(perPage * (page - 1))
    .getMany();

  const nextPageLength = await nodeQuery
    .take(1)
    .skip(perPage * page)
    .getCount();

  return {
    totalCount,
    nodes,
    pageInfo: {
      hasNextPage: nextPageLength > 0,
      startPath: '',
      endPath: '',
    },
  };
}
