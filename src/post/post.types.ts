import { GraphQLInputObjectType, GraphQLString } from 'graphql';

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
}

export const GraphqlPostOptions = new GraphQLInputObjectType({
  name: 'PostOptionsInput',
  fields: {
    userId: {
      type: GraphQLString,
    },
    likeUserId: {
      type: GraphQLString,
    },
  },
});
