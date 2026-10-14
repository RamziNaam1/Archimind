import { Injectable } from '@nestjs/common';
import {
  IUmlGenerator,
  UmlParsedData,
} from '../interfaces/uml-generator.interface';
import { DiagramType } from '@prisma/client';

@Injectable()
export class ClassDiagramGenerator implements IUmlGenerator {
  type = DiagramType.CLASS;

  parse(text: string): UmlParsedData {
    const entities = [...new Set(text.match(/[A-Z][a-z]+/g) || [])];
    const relations: Array<{ from: string; to: string; label?: string }> = [];

    // Logique simplifiée pour l'exemple
    if (entities.length >= 2) {
      relations.push({
        from: entities[0],
        to: entities[1],
        label: 'associé à',
      });
    }

    return { entities, relations };
  }

  generateCode(data: UmlParsedData | string): string {
    if (typeof data === 'string') return data;
    let code = 'classDiagram\n';
    data.entities?.forEach((ent) => (code += `    class ${ent}\n`));
    data.relations?.forEach((rel) => {
      code += `    ${rel.from} --> ${rel.to} : ${rel.label || ''}\n`;
    });
    return code;
  }
}
