import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLString,
} from 'graphql';

export enum AuthRole {
  USER = 'user',

  DEVELOPER = 'developer',
}

export const GraphQLAuthRole = new GraphQLEnumType({
  name: 'AuthRole',
  values: {
    user: {
      value: AuthRole.USER,
      description: '일반사용자',
    },
    developer: {
      value: AuthRole.DEVELOPER,
      description: '개발자(전체권한)',
    },
  },
});

export enum AuthQuestion {
  FAVORITE_FOOD = 'favorite_food',
  FAVORITE_MOVIE = 'favorite_movie',
  FAVORITE_SPORTS = 'favorite_sports',
  FAVORITE_ANIMAL = 'favorite_animal',
  FAVORITE_COLOR = 'favorite_color',
  FAVORITE_NUMBER = 'favorite_number',
}

export const GraphQLAuthQuestion = new GraphQLEnumType({
  name: 'AuthQuestion',
  values: {
    favorite_food: {
      value: AuthQuestion.FAVORITE_FOOD,
      description: '가장 좋아하는 음식은?',
    },
    favorite_movie: {
      value: AuthQuestion.FAVORITE_MOVIE,
      description: '가장 좋아하는 영화는?',
    },
    favorite_sports: {
      value: AuthQuestion.FAVORITE_SPORTS,
      description: '가장 좋아하는 운동은?',
    },
    favorite_animal: {
      value: AuthQuestion.FAVORITE_ANIMAL,
      description: '가장 좋아하는 동물은?',
    },
    favorite_color: {
      value: AuthQuestion.FAVORITE_COLOR,
      description: '가장 좋아하는 색깔은?',
    },
    favorite_number: {
      value: AuthQuestion.FAVORITE_NUMBER,
      description: '가장 좋아하는 숫자는?',
    },
  },
});

export interface UsersOptions {
  /** @description 해당 아이디가 팔로우 하고 있는 유저들을 필터링 */
  followingId?: string;

  /** @description 해당 아이디를 팔로우 하고 있는 유저들을 필터링 */
  followerId?: string;
}

export const GraphqlUsersOptions = new GraphQLInputObjectType({
  name: 'UsersOptionsInput',
  fields: {
    followingId: {
      type: GraphQLString,
      description: '해당 아이디가 팔로우 하고 있는 유저들을 필터링',
    },
    followerId: {
      type: GraphQLString,
      description: '해당 아이디를 팔로우 하고 있는 유저들을 필터링',
    },
  },
});
