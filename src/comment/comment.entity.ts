import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from 'graphst';
import { GraphQLNonNull, GraphQLString } from 'graphql';

@Entity()
@ObjectType()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: String, name: 'post_id' })
  postId!: string;

  @Column({ type: String, name: 'user_id' })
  userId!: string;

  @Field(() => GraphQLNonNull(GraphQLString))
  @Column({
    type: 'text',
  })
  contents!: string;

  @Column({
    type: Number,
    default: 0,
    name: 'count_like',
  })
  countLike!: number;

  @Column({
    type: Number,
    default: 0,
    name: 'count_unlike',
  })
  countUnlike!: number;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    readonly: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt!: number;
}
