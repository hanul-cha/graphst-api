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
