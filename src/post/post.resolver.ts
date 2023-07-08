import { Resolver } from 'graphst';
import { Post } from './post.entity';

@Resolver(() => Post)
export class PostResolver {}
