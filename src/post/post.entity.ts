import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';
import { Field, ObjectType } from 'graphst';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import {
  unixTimeDefaultTransformer,
  unixTimeTransformer,
} from '../utils/typeorm';

@Entity()
@Unique(['id'])
@Index(['title'])
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
    type: Number,
    name: '_count_like',
    default: 0,
  })
  /** @description order를 위한 역정규화 칼럼 */
  _countLike!: number;

  @Column({
    type: Number,
    name: '_count_comment',
    default: 0,
  })
  /** @description order를 위한 역정규화 칼럼 */
  _countComment!: number;

  @Column({
    type: 'timestamp',
    name: 'delete_at',
    transformer: unixTimeTransformer,
    nullable: true,
  })
  deleteAt!: number | null;

  @Field(() => GraphQLNonNull(GraphQLInt))
  @Column({
    type: 'timestamp',
    name: 'created_at',
    readonly: true,
    default: () => 'CURRENT_TIMESTAMP',
    transformer: unixTimeDefaultTransformer,
  })
  createAt!: number;

  @Field(() => GraphQLNonNull(GraphQLInt))
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
