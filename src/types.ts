import { IncomingMessage } from 'http';
import { AuthRole } from './user/user.types';

export interface AuthContext {
  parent: any;
  args: any;
  context: {
    req: IncomingMessage;
    auth: { id: number; roles: AuthRole[] | null; name: string };
    [key: string]: any;
  };
  info: any;
}
