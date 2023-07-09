import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { LikeTargetType } from './like.types';
import { Injectable } from 'graphst';

@Entity()
@Unique(['targetId', 'targetType', 'userId'])
@Injectable()
export class Like extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: String, name: 'target_id' })
  targetId!: string;

  @Column({ type: String, name: 'target_type' })
  targetType!: LikeTargetType;

  @Column({ type: String, name: 'user_id' })
  userId!: string;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    readonly: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt!: number;
}
