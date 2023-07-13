import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Field, ObjectType } from 'graphst';
import { unixTimeTransformer } from '../utils/typeorm';
import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';

@Entity()
@Unique(['label'])
@ObjectType()
export class Category extends BaseEntity {
  @Field(() => GraphQLNonNull(GraphQLID))
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => GraphQLNonNull(GraphQLString))
  @Column({ type: String })
  label!: string;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    readonly: true,
    default: () => 'CURRENT_TIMESTAMP',
    transformer: unixTimeTransformer,
  })
  createAt!: number;
}
