import { GraphQLEnumType, GraphQLString } from 'graphql';

export interface CreatePostProps {
  userId: string;
  title: string;
  contents: string;
  categoryId?: string;
  activeAt?: boolean;
}

export interface postOptions {
  userId?: string;
  likeUserId?: string;
  query?: string;
  categoryId?: string;
}

export const graphqlPostOptions = {
  userId: () => GraphQLString,
  likeUserId: () => GraphQLString,
  query: () => GraphQLString,
  categoryId: () => GraphQLString,
};

export enum PostOrder {
  TITLE = 'title',
  FOLLOWER = 'follower',
  COMMENT = 'comment',
}

export const GraphQLPostOrder = new GraphQLEnumType({
  name: 'PostOrder',
  values: {
    title: {
      value: PostOrder.TITLE,
    },
    follower: {
      value: PostOrder.FOLLOWER,
    },
    comment: {
      value: PostOrder.COMMENT,
    },
  },
});
