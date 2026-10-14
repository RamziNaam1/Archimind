import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { UmlService } from '../uml/uml.service';
import { MessageRole } from '@prisma/client';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly messageRepo: MessageRepository,
    private readonly umlService: UmlService,
  ) {}

  async createConversation(userId: string, title?: string) {
    return this.conversationRepo.create({
      user: { connect: { id: userId } },
      title: title || 'Nouvelle discussion',
    });
  }

  async getConversations(userId: string) {
    return this.conversationRepo.findByUserId(userId);
  }

  async getConversation(id: string, userId: string) {
    const conversation = await this.conversationRepo.findById(id);
    if (!conversation || conversation.userId !== userId) {
      throw new NotFoundException('Discussion non trouvée');
    }
    return conversation;
  }

  async sendMessage(userId: string, conversationId: string, content: string) {
    const conversation = await this.getConversation(conversationId, userId);

    // 1. Save user message
    const userMessage = await this.messageRepo.create({
      content,
      role: MessageRole.USER,
      conversation: { connect: { id: conversationId } },
    });

    // 2. Auto-update title if it's the first message or still named 'Nouvelle discussion'
    if (!conversation.title || conversation.title === 'Nouvelle discussion') {
      const autoTitle =
        content.length > 30 ? content.substring(0, 30) + '...' : content;
      await this.conversationRepo.update(conversationId, { title: autoTitle });
    }

    // 3. Process with UML Service
    const diagram = await this.umlService.generateDiagram(userId, {
      text: content,
    });

    // 4. Save assistant response linked to diagram
    const assistantMessage = await this.messageRepo.create({
      content: `Diagramme ${diagram.type} généré avec succès.`,
      role: MessageRole.ASSISTANT,
      conversation: { connect: { id: conversationId } },
      diagram: { connect: { id: diagram.id } },
    });

    return {
      conversationId,
      userMessage,
      assistantMessage,
      diagram,
    };
  }

  async deleteConversation(id: string, userId: string) {
    const conversation = await this.getConversation(id, userId);
    return this.conversationRepo.delete(conversation.id);
  }

  async deleteAllConversations(userId: string) {
    return this.conversationRepo.deleteManyByUserId(userId);
  }
}
