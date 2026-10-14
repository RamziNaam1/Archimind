import { Injectable } from '@nestjs/common';
import { IUmlGenerator, UmlParsedData } from '../interfaces/uml-generator.interface';
import { DiagramType } from '@prisma/client';

@Injectable()
export class ErDiagramGenerator implements IUmlGenerator {
  type = DiagramType.ER;

  parse(text: string): UmlParsedData {
    // Extract capitalized words as entities
    const entities = [...new Set(text.match(/[A-Z][a-zÀ-ÿ]+/g) || [])];
    const relations: Array<{ from: string; to: string; label?: string }> = [];

    // Simple heuristic: link consecutive entities
    for (let i = 0; i < entities.length - 1; i++) {
      relations.push({ from: entities[i], to: entities[i + 1], label: 'lié à' });
    }

    return { entities, relations };
  }

  generateCode(data: UmlParsedData | string): string {
    if (typeof data === 'string') return data;
    let code = 'erDiagram\n';
    data.entities?.forEach((ent) => {
      code += `    ${ent.toUpperCase()} {\n        string id PK\n        string nom\n    }\n`;
    });
    data.relations?.forEach((rel) => {
      code += `    ${rel.from.toUpperCase()} ||--o{ ${rel.to.toUpperCase()} : "${rel.label || 'lié à'}"\n`;
    });
    return code;
  }
}
