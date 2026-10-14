import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Attach this guard to any route that requires a valid JWT access token.
 * It will automatically validate the Bearer token and populate req.user.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
