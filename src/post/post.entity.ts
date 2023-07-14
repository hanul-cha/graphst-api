import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';
import { Field, ObjectType } from 'graphst';
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import {
  unixTimeDefaultTransformer,
  unixTimeTransformer,
} from '../utils/typeorm';

@Entity()
@Unique(['id'])
@ObjectType()
export class Post extends BaseEntity {
  @Field(() => GraphQLNonNull(GraphQLID))
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: String, name: 'user_id' })
  userId!: string;

  @Field(() => GraphQLNonNull(GraphQLString))
  @Column({ type: String })
  title!: string;

  @Field(() => GraphQLNonNull(GraphQLString))
  @Column({
    type: 'text',
  })
  contents!: string;

  @Column({ type: String, name: 'category_id', nullable: true })
  categoryId!: string | null;

  @Column({
    type: 'timestamp',
    name: 'active_at',
    transformer: unixTimeTransformer,
    nullable: true,
  })
  activeAt!: number | null;

  @Column({
    type: 'timestamp',
    name: 'delete_at',
    transformer: unixTimeTransformer,
    nullable: true,
  })
  deleteAt!: number | null;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    readonly: true,
    default: () => 'CURRENT_TIMESTAMP',
    transformer: unixTimeDefaultTransformer,
  })
  createAt!: number;

  @Column({
    type: 'timestamp',
    name: 'update_at',
    readonly: true,
    default: () => 'CURRENT_TIMESTAMP',
    transformer: unixTimeDefaultTransformer,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updateAt!: number;
}
