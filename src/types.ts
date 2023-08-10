import { IncomingMessage } from 'http';
import { AuthRole } from './user/user.types';

export interface AuthContext {
  req: IncomingMessage;
  auth?: { id: number; roles: AuthRole[] | null; name: string } | null;
  [key: string]: any;
}

export interface VerifiedAuthContext extends AuthContext {
  auth: { id: number; roles: AuthRole[] | null; name: string };
}

export interface GraphstApiProps {
  parent: any;
  args: any;
  context: AuthContext;
  info: any;
}
