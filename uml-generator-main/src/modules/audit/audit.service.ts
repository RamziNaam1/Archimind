import { Injectable } from '@nestjs/common';
import { AuditRepository } from './repositories/audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepo: AuditRepository) {}

  async log(
    userId: string,
    action: string,
    targetEntity?: string,
    targetId?: string,
    metadata?: any,
  ) {
    return this.auditRepo.logAction(
      userId,
      action,
      targetEntity,
      targetId,
      metadata,
    );
  }
}
