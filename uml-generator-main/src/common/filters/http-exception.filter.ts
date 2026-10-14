import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP exception filter.
 * Catches all HttpExceptions and formats them into a consistent JSON response:
 * {
 *   statusCode: number,
 *   timestamp: string,
 *   path: string,
 *   message: string | string[]
 * }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? ((exceptionResponse as Record<string, unknown>).message as
              | string
              | string[])
          : exception.message;
    } else if (this.isPrismaError(exception)) {
      status = HttpStatus.BAD_REQUEST;
      message = this.handlePrismaError(exception);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `[${request.method}] ${request.url} → ${status}: ${JSON.stringify(message)}`,
      status === HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof Error
        ? exception.stack
        : undefined,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private isPrismaError(error: any): boolean {
    return error.code && error.code.startsWith('P');
  }

  private handlePrismaError(error: any): string {
    switch (error.code) {
      case 'P2002':
        return `Contrainte d'unicité violée sur le champ : ${error.meta?.target}`;
      case 'P2003':
        return 'Erreur de clé étrangère (Relation invalide)';
      case 'P2025':
        return 'Enregistrement non trouvé';
      default:
        return `Erreur de base de données (${error.code})`;
    }
  }
}
