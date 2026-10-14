import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '@modules/audit/audit.service';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;

    if (!['POST', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          const userPayload = user as any; // Utilisation de 'any' pour éviter les erreurs de typage strict
          
          if (userPayload) {
            // 🔑 CORRECTIF : On cherche l'ID dans les 3 champs possibles
            const userId = userPayload.userId || userPayload.sub || userPayload.id;
            
            if (userId) {
              const action = `${method} ${url}`;
              const targetEntity = this.extractEntity(url);
              const targetId = response?.id || body?.id || null;

              await this.auditService.log(
                userId, // Utilisation de l'ID sécurisé
                action,
                targetEntity,
                targetId,
                {
                  statusCode: context.switchToHttp().getResponse().statusCode,
                  ip: request.ip,
                  userAgent: request.headers['user-agent'],
                },
              );
            }
          }
        } catch (error) {
          this.logger.error(`Erreur lors de l'audit: ${error.message}`);
        }
      }),
    );
  }

  private extractEntity(url: string): string {
    const parts = url.split('/');
    return parts[2] || 'unknown';
  }
}