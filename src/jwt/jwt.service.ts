import { Injectable } from 'graphst';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  secretKey = process.env.JWT_SECRET_KEY ?? '';

  sign(payload: object, options?: jwt.SignOptions): string {
    return jwt.sign(payload, this.secretKey, options);
  }

  verify(token: string): any {
    return jwt.verify(token, this.secretKey);
  }
}
