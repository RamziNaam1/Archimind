import { Injectable } from '@nestjs/common';
import {
  IUmlGenerator,
  UmlParsedData,
} from '../interfaces/uml-generator.interface';
import { DiagramType } from '@prisma/client';

@Injectable()
export class ActivityDiagramGenerator implements IUmlGenerator {
  type = DiagramType.ACTIVITY;

  parse(text: string): UmlParsedData {
    // Analyse simplifiée : "Etape 1 puis Etape 2"
    const steps = text
      .split(/then|puis|next|->/i)
      .map((s) => s.trim().replace(/[^\w\s]/g, ''));
    const entities = steps.filter((s) => s.length > 0);
    const relations: Array<{ from: string; to: string; label?: string }> = [];

    for (let i = 0; i < entities.length - 1; i++) {
      relations.push({ from: entities[i], to: entities[i + 1] });
    }

    return { entities, relations };
  }

  generateCode(data: UmlParsedData): string {
    let code = 'stateDiagram-v2\n';
    code += '    [*] --> ' + (data.entities?.[0] || 'Start') + '\n';

    data.relations?.forEach((rel) => {
      code += `    ${rel.from.replace(/\s+/g, '_')} --> ${rel.to.replace(/\s+/g, '_')}\n`;
    });

    if (data.entities && data.entities.length > 0) {
      code += `    ${data.entities[data.entities.length - 1].replace(/\s+/g, '_')} --> [*]\n`;
    }

    return code;
  }
}
