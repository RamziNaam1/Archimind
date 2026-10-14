import { Injectable, Logger } from '@nestjs/common';

/**
 * Validates generated Mermaid.js code by checking for known diagram
 * type keywords and basic structural integrity.
 */
@Injectable()
export class MermaidValidatorService {
  private readonly logger = new Logger(MermaidValidatorService.name);

  private readonly DIAGRAM_KEYWORDS: Record<string, string[]> = {
    CLASS: ['classDiagram'],
    USE_CASE: ['useCaseDiagram', 'usecaseDiagram'],
    SEQUENCE: ['sequenceDiagram'],
    ACTIVITY: ['stateDiagram-v2', 'stateDiagram'],
    ER: ['erDiagram'],
  };

  /**
   * Validates that generated code looks like valid Mermaid for the expected type.
   * Returns { valid, errors }.
   */
  validate(
    code: string,
    expectedType: string,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const trimmed = code.trim();

    if (!trimmed) {
      errors.push('Generated code is empty.');
      return { valid: false, errors };
    }

    // Check minimum length
    if (trimmed.length < 15) {
      errors.push('Generated code is too short to be a valid diagram.');
    }

    // Check that code starts with an expected keyword for the type
    const keywords = this.DIAGRAM_KEYWORDS[expectedType];
    if (keywords) {
      const firstLine = trimmed.split('\n')[0].trim();
      const startsCorrectly = keywords.some((kw) =>
        firstLine.startsWith(kw),
      );
      if (!startsCorrectly) {
        errors.push(
          `Expected diagram to start with one of [${keywords.join(', ')}], but got: "${firstLine.substring(0, 40)}"`,
        );
      }
    }

    // Check for common malformed patterns
    if (trimmed.includes('```')) {
      errors.push('Code contains markdown code fences (```) which should be stripped.');
    }

    // Check for balanced braces in class/ER diagrams
    if (['CLASS', 'ER'].includes(expectedType)) {
      const nonRelationText = trimmed
        .split('\n')
        .filter((line) => !line.includes('--') && !line.includes('..'))
        .join('\n');
      const openBraces = (nonRelationText.match(/{/g) || []).length;
      const closeBraces = (nonRelationText.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push(
          `Unbalanced braces: ${openBraces} opening vs ${closeBraces} closing.`,
        );
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Attempts basic cleanup of common AI-generated issues.
   */
  cleanup(code: string): string {
    let cleaned = code.trim();

    // Remove markdown fences
    cleaned = cleaned.replace(/```mermaid\s*/gi, '');
    cleaned = cleaned.replace(/```\s*/g, '');

    // Remove leading/trailing whitespace lines
    cleaned = cleaned
      .split('\n')
      .filter((line, i, arr) => {
        // Keep non-empty lines, or empty lines that are between content
        if (line.trim() !== '') return true;
        return i > 0 && i < arr.length - 1;
      })
      .join('\n');

    return cleaned.trim();
  }
}
