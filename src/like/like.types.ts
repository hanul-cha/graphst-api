import { VerifiedAuthContext } from '../types';

export enum LikeTargetType {
  User = 'User',
  Post = 'Post',
  CommentLike = 'CommentLike',
  CommentUnlike = 'CommentUnlike',
}

export interface VerifiedLikeContext extends VerifiedAuthContext {
  likeTargetType: LikeTargetType;
}
