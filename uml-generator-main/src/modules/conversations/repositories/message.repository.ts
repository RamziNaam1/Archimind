import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Message, Prisma } from '@prisma/client';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MessageCreateInput): Promise<Message> {
    return this.prisma.message.create({
      data,
      include: {
        diagram: true,
      },
    });
  }

  async findByConversationId(conversationId: string): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        diagram: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
