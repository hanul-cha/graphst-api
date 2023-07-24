import { getUnixTime } from 'date-fns';
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
    return new Date(value * 1000);
  },
  from: (value: Date | null) => {
    if (!value) {
      return null;
    }
    return getUnixTime(value);
  },
};

export const unixTimeDefaultTransformer = {
  to: (value: number | null) => {
    if (!value) {
      return new Date();
    }
    return new Date(value);
  },
  from: (value: Date | null) => {
    if (!value) {
      return null;
    }
    return getUnixTime(value);
  },
};
