import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';
import { Field, ObjectType } from 'graphst';
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

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

  @Column({
    type: 'timestamp',
    name: 'created_at',
    readonly: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt!: number;

  @Column({
    type: 'timestamp',
    name: 'update_at',
    readonly: true,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updateAt!: number;
}
