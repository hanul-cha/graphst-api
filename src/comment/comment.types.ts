import { GraphQLString } from 'graphql';

export interface CommentOptions {
  postId?: string;
}

export const graphqlCommentOptions = {
  postId: () => GraphQLString,
};
