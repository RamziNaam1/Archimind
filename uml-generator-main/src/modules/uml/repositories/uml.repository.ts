import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Diagram, Prisma } from '@prisma/client';

@Injectable()
export class UmlRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DiagramCreateInput): Promise<Diagram> {
    return this.prisma.diagram.create({ data });
  }

  async findByUserId(userId: string): Promise<Diagram[]> {
    return this.prisma.diagram.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Diagram | null> {
    return this.prisma.diagram.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.DiagramUpdateInput): Promise<Diagram> {
    return this.prisma.diagram.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Diagram> {
    return this.prisma.diagram.delete({
      where: { id },
    });
  }
}
