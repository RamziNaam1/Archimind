import { Injectable } from '@nestjs/common';
import {
  IUmlGenerator,
  UmlParsedData,
} from '../interfaces/uml-generator.interface';
import { DiagramType } from '@prisma/client';

@Injectable()
export class UseCaseGenerator implements IUmlGenerator {
  type = DiagramType.USE_CASE;

  parse(text: string): UmlParsedData {
    const actors = text.includes('utilisateur') ? ['Utilisateur'] : ['Acteur'];
    const entities = text.includes('commande')
      ? ['Passer Commande']
      : ['Action'];
    const relations = [{ from: actors[0], to: entities[0] }];

    return { actors, entities, relations };
  }

  generateCode(data: UmlParsedData): string {
    let code = 'useCaseDiagram\n';
    data.actors?.forEach((act) => (code += `    actor :${act}:\n`));
    data.entities?.forEach((useCase) => (code += `    usecase (${useCase})\n`));
    data.relations?.forEach((rel) => {
      code += `    :${rel.from}: --> (${rel.to})\n`;
    });
    return code;
  }
}
