import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditService } from './audit.service';
import { AuditRepository } from './repositories/audit.repository';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { AdminController } from './admin.controller';

@Global()
@Module({
  controllers: [AdminController],
  providers: [
    AuditService,
    AuditRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
