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
  to: () => new Date().getTime(),
  from: (value: number) => new Date(value),
};
