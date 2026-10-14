import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { SecretsService } from '../../../config/secrets.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private secrets: SecretsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secrets.jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
  return {
    sub: payload.sub,
    id: payload.sub,
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}
}
