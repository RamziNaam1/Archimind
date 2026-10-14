import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DiagramType } from '@prisma/client';

export class GenerateUmlDto {
  @ApiProperty({
    example: 'Un client peut passer une commande de livres.',
    description: 'Description textuelle du diagramme.',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    description: 'Nom du projet/diagramme',
  })
  @IsString()
  @IsOptional()
  name?: string;
  

  @ApiProperty({
    enum: DiagramType,
    default: DiagramType.USE_CASE,
    description: 'Type de diagramme UML',
  })
  @IsEnum(DiagramType)
  @IsOptional()
  type?: DiagramType;
}