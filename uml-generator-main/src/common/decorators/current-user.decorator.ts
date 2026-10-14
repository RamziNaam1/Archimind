import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Injects the authenticated user from the JWT payload into a route handler parameter.
 *
 * Usage:
 *   @Get('me')
 *   getMe(@CurrentUser() user: JwtPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Set by JwtStrategy.validate()
  },
);
