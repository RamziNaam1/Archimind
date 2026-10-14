import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import * as jwtPayload from '@modules/auth/interfaces/jwt-payload.interface';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
} from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

class CreateConversationDto {
  @ApiProperty({ example: 'Analyse du système de commande', required: false })
  @IsString()
  @IsOptional()
  title?: string;
}

class SendMessageDto {
  @ApiProperty({
    example: 'Ajoute un acteur "Vendeur" qui peut valider la commande.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

@ApiTags('Conversations & Chat')
@ApiBearerAuth()
@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({ summary: 'Démarrer une nouvelle discussion' })
  @ApiResponse({ status: 201, description: 'La conversation a été créée.' })
  async create(
    @CurrentUser() user: jwtPayload.JwtPayload,
    @Body() dto: CreateConversationDto,
  ) {
    return this.conversationService.createConversation(user.sub, dto.title);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes mes discussions' })
  async list(@CurrentUser() user: jwtPayload.JwtPayload) {
    return this.conversationService.getConversations(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: "Récupérer l'historique d'une discussion par ID" })
  @ApiResponse({
    status: 200,
    description: 'Historique complet incluant les messages et diagrammes.',
  })
  @ApiResponse({ status: 404, description: 'Conversation inexistante.' })
  async get(
    @CurrentUser() user: jwtPayload.JwtPayload,
    @Param('id') id: string,
  ) {
    return this.conversationService.getConversation(id, user.sub);
  }

  @Post(':id/messages')
  @ApiOperation({
    summary: 'Envoyer un message et générer/mettre-à-jour le diagramme',
    description:
      "Envoie du texte à l'IA. Elle renverra un message ASSISTANT et le diagramme UML correspondant.",
  })
  async sendMessage(
    @CurrentUser() user: jwtPayload.JwtPayload,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.conversationService.sendMessage(user.sub, id, dto.content);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une discussion spécifique' })
  async delete(
    @CurrentUser() user: jwtPayload.JwtPayload,
    @Param('id') id: string,
  ) {
    return this.conversationService.deleteConversation(id, user.sub);
  }

  @Delete()
  @ApiOperation({
    summary: 'Supprimer TOUTES les discussions (Reset total du chat)',
  })
  async deleteAll(@CurrentUser() user: jwtPayload.JwtPayload) {
    return this.conversationService.deleteAllConversations(user.sub);
  }
}
