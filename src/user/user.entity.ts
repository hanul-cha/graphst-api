import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';
import { Field, ObjectType } from 'graphst';
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import {
  AuthQuestion,
  AuthRole,
  GraphQLAuthQuestion,
  GraphQLAuthRole,
} from './user.types';

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

  @Field(() => GraphQLList(GraphQLNonNull(GraphQLAuthRole)))
  @Column({
    type: 'json',
    default: null,
  })
  roles!: AuthRole[] | null;

  @Field(() => GraphQLNonNull(GraphQLAuthQuestion))
  @Column({
    type: String,
    name: 'question_for_search',
  })
  questionForSearch!: AuthQuestion;

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
