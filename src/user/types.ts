import { GraphQLEnumType } from 'graphql';

export enum AuthRole {
  ADMIN_USER = 'admin::user', // 일반사용자

  ADMIN_DEVELOPER = 'admin::developer', // 개발자 (전체권한)
}

export const GraphQLAuthRole = new GraphQLEnumType({
  name: 'AuthRole',
  values: {
    ADMIN_USER: {
      value: AuthRole.ADMIN_USER,
      description: '일반사용자',
    },
    ADMIN_DEVELOPER: {
      value: AuthRole.ADMIN_DEVELOPER,
      description: '개발자(전체권한)',
    },
  },
});

export enum AuthQuestion {
  FAVORITE_FOOD = 'favorite_food', // 가장 좋아하는 음식은?
  FAVORITE_MOVIE = 'favorite_movie', // 가장 좋아하는 영화는?
  FAVORITE_SPORTS = 'favorite_sports', // 가장 좋아하는 운동은?
  FAVORITE_ANIMAL = 'favorite_animal', // 가장 좋아하는 동물은?
  FAVORITE_COLOR = 'favorite_color', // 가장 좋아하는 색깔은?
  FAVORITE_NUMBER = 'favorite_number', // 가장 좋아하는 숫자는?
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
