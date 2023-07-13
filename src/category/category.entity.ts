import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Injectable } from 'graphst';
import { unixTimeTransformer } from '../utils/typeorm';

@Entity()
@Unique(['label'])
@Injectable()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

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
