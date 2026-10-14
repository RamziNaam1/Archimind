import { DiagramType } from '@prisma/client';

export interface UmlParsedData {
  actors?: string[];
  entities?: string[];
  relations?: Array<{ from: string; to: string; label?: string }>;
}

export interface IUmlGenerator {
  type: DiagramType;
  parse(text: string): UmlParsedData;
  generateCode(data: UmlParsedData | string): string | Promise<string>;
}
