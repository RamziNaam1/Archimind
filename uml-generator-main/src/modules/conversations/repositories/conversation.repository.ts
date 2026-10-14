import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Conversation, Prisma } from '@prisma/client';

@Injectable()
export class ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ConversationCreateInput): Promise<Conversation> {
    return this.prisma.conversation.create({ data });
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    return this.prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.ConversationUpdateInput,
  ): Promise<Conversation> {
    return this.prisma.conversation.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Conversation> {
    return this.prisma.conversation.delete({ where: { id } });
  }

  async deleteManyByUserId(userId: string) {
    return this.prisma.conversation.deleteMany({
      where: { userId },
    });
  }
}
