import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que protege as APIs administrativas exigindo um token JWT valido.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
