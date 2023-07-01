import { GraphQLEnumType } from 'graphql';

export enum AuthRole {
  USER = 'user',

  DEVELOPER = 'developer',
}

export const GraphQLAuthRole = new GraphQLEnumType({
  name: 'AuthRole',
  values: {
    USER: {
      value: AuthRole.USER,
      description: '일반사용자',
    },
    DEVELOPER: {
      value: AuthRole.DEVELOPER,
      description: '개발자(전체권한)',
    },
  },
});

export enum AuthQuestion {
  FAVORITE_FOOD = 'FAVORITE_FOOD',
  FAVORITE_MOVIE = 'FAVORITE_MOVIE',
  FAVORITE_SPORTS = 'FAVORITE_SPORTS',
  FAVORITE_ANIMAL = 'FAVORITE_ANIMAL',
  FAVORITE_COLOR = 'FAVORITE_COLOR',
  FAVORITE_NUMBER = 'FAVORITE_NUMBER',
}

export const GraphQLAuthQuestion = new GraphQLEnumType({
  name: 'AuthQuestion',
  values: {
    FAVORITE_FOOD: {
      value: AuthQuestion.FAVORITE_FOOD,
      description: '가장 좋아하는 음식은?',
    },
    FAVORITE_MOVIE: {
      value: AuthQuestion.FAVORITE_MOVIE,
      description: '가장 좋아하는 영화는?',
    },
    FAVORITE_SPORTS: {
      value: AuthQuestion.FAVORITE_SPORTS,
      description: '가장 좋아하는 운동은?',
    },
    FAVORITE_ANIMAL: {
      value: AuthQuestion.FAVORITE_ANIMAL,
      description: '가장 좋아하는 동물은?',
    },
    FAVORITE_COLOR: {
      value: AuthQuestion.FAVORITE_COLOR,
      description: '가장 좋아하는 색깔은?',
    },
    FAVORITE_NUMBER: {
      value: AuthQuestion.FAVORITE_NUMBER,
      description: '가장 좋아하는 숫자는?',
    },
  },
});
