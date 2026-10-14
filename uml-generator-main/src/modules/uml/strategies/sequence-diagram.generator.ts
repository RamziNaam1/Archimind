import { Injectable } from '@nestjs/common';
import {
  IUmlGenerator,
  UmlParsedData,
} from '../interfaces/uml-generator.interface';
import { DiagramType } from '@prisma/client';

@Injectable()
export class SequenceDiagramGenerator implements IUmlGenerator {
  type = DiagramType.SEQUENCE;

  parse(text: string): UmlParsedData {
    // Regex pour détecter les interactions : "Acteur -> Système : Message"
    const interactionRegex =
      /([A-Z][a-z0-9_]+)\s*->\s*([A-Z][a-z0-9_]+)\s*:\s*(.+)/g;
    const entities = new Set<string>();
    const relations: Array<{ from: string; to: string; label?: string }> = [];

    let match;
    while ((match = interactionRegex.exec(text)) !== null) {
      const [, from, to, label] = match;
      entities.add(from);
      entities.add(to);
      relations.push({ from, to, label: label.trim() });
    }

    // Si aucun match, on essaie d'extraire au moins les entités
    if (entities.size === 0) {
      text.match(/[A-Z][a-z]+/g)?.forEach((e) => entities.add(e));
    }

    return {
      entities: Array.from(entities),
      relations,
    };
  }

  generateCode(data: UmlParsedData): string {
    let code = 'sequenceDiagram\n';

    // Ajout des participants
    data.entities?.forEach((ent) => {
      code += `    participant ${ent}\n`;
    });

    // Ajout des interactions
    data.relations?.forEach((rel) => {
      code += `    ${rel.from}->>${rel.to}: ${rel.label || 'interaction'}\n`;
    });

    return code;
  }
}
