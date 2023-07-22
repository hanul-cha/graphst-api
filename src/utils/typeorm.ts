import {
  ObjectLiteral,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';

export function validateAlias<T extends ObjectLiteral>(
  qb: WhereExpressionBuilder,
  alias: string
): qb is SelectQueryBuilder<T> {
  return (
    qb instanceof SelectQueryBuilder &&
    qb.expressionMap.mainAlias?.name === alias
  );
}

export const unixTimeTransformer = {
  to: (value: number | null) => {
    if (!value) {
      return null;
    }
    return new Date(new Date(value * 1000));
  },
  from: (value: string | null) => {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    return Math.floor(date.getTime() / 1000);
  },
};

export const unixTimeDefaultTransformer = {
  to: (value: number | null) => {
    if (!value) {
      return new Date();
    }
    return new Date(value);
  },
  from: (value: string | null) => {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    return Math.floor(date.getTime() / 1000);
  },
};
