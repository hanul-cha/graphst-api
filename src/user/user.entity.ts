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
@Unique(['userId'])
@ObjectType()
export class User extends BaseEntity {
  @Field(() => GraphQLNonNull(GraphQLID))
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => GraphQLNonNull(GraphQLString))
  @Column({ type: String, name: 'user_id' })
  userId!: string;

  @Column({ type: String })
  password!: string;

  @Field(() => GraphQLNonNull(GraphQLString))
  @Column({ type: String })
  name!: string;

  @Column({
    type: 'json',
    default: null,
  })
  roles!: string[] | null;

  @Field(() => GraphQLNonNull(GraphQLString))
  @Column({
    type: String,
    name: 'question_for_search',
  })
  questionForSearch!: string;

  @Field(() => GraphQLNonNull(GraphQLString))
  @Column({
    type: String,
    name: 'answer_for_search',
  })
  answerForSearch!: string;

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
