import { Injectable } from '@nestjs/common';
import {
  IUmlGenerator,
  UmlParsedData,
} from '../interfaces/uml-generator.interface';
import { DiagramType } from '@prisma/client';
import { AiService } from '@ai/ai.service';

@Injectable()
export class AiDiagramGenerator implements IUmlGenerator {
  type = null as any;

  constructor(private readonly aiService: AiService) {}

  parse(text: string): UmlParsedData {
    // L'IA gère le texte brut directement
    return { entities: [], relations: [] };
  }

  async generateCode(
    data: string | UmlParsedData,
    type?: DiagramType,
  ): Promise<string> {
    const prompt = typeof data === 'string' ? data : JSON.stringify(data);
    return this.aiService.generateDiagramCode(
      prompt,
      type || DiagramType.CLASS,
    );
  }
}
