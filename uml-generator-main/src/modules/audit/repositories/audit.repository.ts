import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(
    userId: string,
    action: string,
    targetEntity?: string,
    targetId?: string,
    metadata?: any,
  ) {
    return this.prisma.auditLog.create({
      data: {
        admin: { connect: { id: userId } }, // 'adminId' dans le schéma, mais utilisé pour tout utilisateur ici
        action,
        targetEntity,
        targetId,
        metadata: metadata ? metadata : undefined,
      },
    });
  }
}
