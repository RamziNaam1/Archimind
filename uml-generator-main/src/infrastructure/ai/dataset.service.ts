import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '@database/prisma.service';
import { DiagramStatus } from '@prisma/client';

export interface DatasetEntry {
  prompt: string;
  type: string;
  mermaid: string;
}

export interface DatasetStats {
  total: number;
  byType: Record<string, number>;
  avgPromptLength: number;
  avgMermaidLength: number;
}

export interface ValidationResult {
  index: number;
  prompt: string;
  type: string;
  errors: string[];
}

@Injectable()
export class DatasetService implements OnModuleInit {
  private readonly logger = new Logger(DatasetService.name);
  private dataset: DatasetEntry[] = [];
  private readonly datasetPath = join(process.cwd(), 'dataset.json');

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.loadDataset();
  }

  async loadDataset() {
    try {
      const data = await fs.readFile(this.datasetPath, 'utf8');
      this.dataset = JSON.parse(data) as DatasetEntry[];
      this.logger.log(`Dataset chargé : ${this.dataset.length} entrées`);
    } catch {
      this.logger.warn(
        "Aucun fichier dataset.json trouvé. Création d'un exemple...",
      );
      await this.createInitialDataset();
    }
  }

  /**
   * Returns examples for few-shot prompting.
   * If a query is provided, selects examples most similar to it using TF-IDF cosine similarity.
   * Otherwise returns the first `limit` examples filtered by type.
   */
  getExamples(type?: string, limit: number = 3, query?: string): DatasetEntry[] {
    const filtered = type
      ? this.dataset.filter((e) => e.type === type)
      : this.dataset;

    if (!query || filtered.length <= limit) {
      return filtered.slice(0, limit);
    }

    // TF-IDF cosine similarity for better example selection
    return this.selectBySimilarity(filtered, query, limit);
  }

  /**
   * Returns the full dataset array.
   */
  getAll(): DatasetEntry[] {
    return [...this.dataset];
  }

  async addEntry(entry: DatasetEntry) {
    this.dataset.push(entry);
    await this.saveDataset();
  }

  /**
   * Returns statistics about the current dataset.
   */
  getStats(): DatasetStats {
    const byType: Record<string, number> = {};
    let totalPromptLen = 0;
    let totalMermaidLen = 0;

    for (const entry of this.dataset) {
      byType[entry.type] = (byType[entry.type] || 0) + 1;
      totalPromptLen += entry.prompt.length;
      totalMermaidLen += entry.mermaid.length;
    }

    return {
      total: this.dataset.length,
      byType,
      avgPromptLength: this.dataset.length > 0
        ? Math.round(totalPromptLen / this.dataset.length)
        : 0,
      avgMermaidLength: this.dataset.length > 0
        ? Math.round(totalMermaidLen / this.dataset.length)
        : 0,
    };
  }

  /**
   * Validates all dataset entries using basic Mermaid structural checks.
   * Returns an array of entries with validation errors.
   */
  validateAll(): ValidationResult[] {
    const DIAGRAM_KEYWORDS: Record<string, string[]> = {
      CLASS: ['classDiagram'],
      USE_CASE: ['useCaseDiagram', 'usecaseDiagram'],
      SEQUENCE: ['sequenceDiagram'],
      ACTIVITY: ['stateDiagram-v2', 'stateDiagram'],
      ER: ['erDiagram'],
    };

    const results: ValidationResult[] = [];

    for (let i = 0; i < this.dataset.length; i++) {
      const entry = this.dataset[i];
      const errors: string[] = [];
      const trimmed = entry.mermaid.trim();

      if (!trimmed) {
        errors.push('Mermaid code is empty.');
      }

      if (trimmed.length < 15) {
        errors.push('Mermaid code is too short.');
      }

      // Check starting keyword
      const keywords = DIAGRAM_KEYWORDS[entry.type];
      if (keywords) {
        const firstLine = trimmed.split('\n')[0].trim();
        const startsCorrectly = keywords.some((kw) => firstLine.startsWith(kw));
        if (!startsCorrectly) {
          errors.push(
            `Expected start keyword [${keywords.join(', ')}], got: "${firstLine.substring(0, 40)}"`,
          );
        }
      }

      // Check for markdown fences
      if (trimmed.includes('```')) {
        errors.push('Contains markdown code fences.');
      }

      // Check balanced braces for CLASS/ER
      if (['CLASS', 'ER'].includes(entry.type)) {
        const nonRelationText = trimmed
          .split('\n')
          .filter((line) => !line.includes('--') && !line.includes('..'))
          .join('\n');
        const openBraces = (nonRelationText.match(/{/g) || []).length;
        const closeBraces = (nonRelationText.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
          errors.push(`Unbalanced braces: ${openBraces} open vs ${closeBraces} close.`);
        }
      }

      if (errors.length > 0) {
        results.push({ index: i, prompt: entry.prompt.substring(0, 60), type: entry.type, errors });
      }
    }

    return results;
  }

  /**
   * Harvests successful diagrams from the database and adds them to the dataset.
   * Deduplicates by comparing inputDescription to existing prompts.
   */
  async harvestFromDatabase(): Promise<{ added: number; skipped: number }> {
    const existingPrompts = new Set(
      this.dataset.map((e) => e.prompt.toLowerCase().trim()),
    );

    const dbDiagrams = await this.prisma.diagram.findMany({
      where: {
        status: DiagramStatus.SUCCESS,
        inputDescription: { not: null },
        generatedCode: { not: null },
      },
    });

    let added = 0;
    let skipped = 0;

    for (const diag of dbDiagrams) {
      if (!diag.inputDescription || !diag.generatedCode) {
        skipped++;
        continue;
      }

      const normalizedPrompt = diag.inputDescription.toLowerCase().trim();
      if (existingPrompts.has(normalizedPrompt)) {
        skipped++;
        continue;
      }

      this.dataset.push({
        prompt: diag.inputDescription,
        type: diag.type,
        mermaid: diag.generatedCode,
      });
      existingPrompts.add(normalizedPrompt);
      added++;
    }

    if (added > 0) {
      await this.saveDataset();
    }

    this.logger.log(`Harvest complete: ${added} added, ${skipped} skipped.`);
    return { added, skipped };
  }

  /**
   * Evaluates generator quality on a sample of the dataset.
   */
  async evaluate(
    generator: (prompt: string, type: string) => Promise<string>,
    validator: (code: string, type: string) => { valid: boolean; errors: string[] },
    sampleSizePerType: number = 3,
  ): Promise<{
    total: number;
    validCount: number;
    successRate: number;
    avgTimeMs: number;
    results: Array<{
      prompt: string;
      type: string;
      valid: boolean;
      timeMs: number;
      errors: string[];
    }>;
  }> {
    const types = ['CLASS', 'USE_CASE', 'SEQUENCE', 'ACTIVITY', 'ER'];
    const testSet: DatasetEntry[] = [];

    for (const type of types) {
      const typeEntries = this.dataset.filter((e) => e.type === type);
      const shuffled = [...typeEntries].sort(() => 0.5 - Math.random());
      testSet.push(...shuffled.slice(0, sampleSizePerType));
    }

    let validCount = 0;
    let totalTime = 0;
    const results: Array<{
      prompt: string;
      type: string;
      valid: boolean;
      timeMs: number;
      errors: string[];
    }> = [];

    for (const entry of testSet) {
      const start = Date.now();
      let generatedCode = '';
      let isValid = false;
      let errors: string[] = [];
      let timeMs = 0;

      try {
        generatedCode = await generator(entry.prompt, entry.type);
        timeMs = Date.now() - start;
        totalTime += timeMs;

        const valResult = validator(generatedCode, entry.type);
        isValid = valResult.valid;
        errors = valResult.errors;

        if (isValid) {
          validCount++;
        }
      } catch (err) {
        timeMs = Date.now() - start;
        totalTime += timeMs;
        errors = [err instanceof Error ? err.message : String(err)];
      }

      results.push({
        prompt: entry.prompt,
        type: entry.type,
        valid: isValid,
        timeMs,
        errors,
      });
    }

    return {
      total: testSet.length,
      validCount,
      successRate: testSet.length > 0 ? Math.round((validCount / testSet.length) * 100) : 0,
      avgTimeMs: testSet.length > 0 ? Math.round(totalTime / testSet.length) : 0,
      results,
    };
  }

  /**
   * Exports the entire dataset (JSON dataset + successful database diagrams) in Llama 3 JSONL format
   */
  async exportToLlama3Jsonl(): Promise<string> {
    const jsonlLines: string[] = [];

    // 1. Add static dataset entries
    for (const entry of this.dataset) {
      const line = {
        instruction: `Generate Mermaid UML diagram of type ${entry.type}`,
        input: entry.prompt,
        output: entry.mermaid,
      };
      jsonlLines.push(JSON.stringify(line));
    }

    // 2. Add successful diagrams from DB (that are not already in dataset)
    try {
      const existingPrompts = new Set(
        this.dataset.map((e) => e.prompt.toLowerCase().trim()),
      );

      const dbDiagrams = await this.prisma.diagram.findMany({
        where: {
          status: DiagramStatus.SUCCESS,
          inputDescription: { not: null },
          generatedCode: { not: null },
        },
      });

      let dbCount = 0;
      for (const diag of dbDiagrams) {
        if (diag.inputDescription && diag.generatedCode) {
          const normalized = diag.inputDescription.toLowerCase().trim();
          if (!existingPrompts.has(normalized)) {
            const line = {
              instruction: `Generate Mermaid UML diagram of type ${diag.type}`,
              input: diag.inputDescription,
              output: diag.generatedCode,
            };
            jsonlLines.push(JSON.stringify(line));
            existingPrompts.add(normalized);
            dbCount++;
          }
        }
      }
      this.logger.log(
        `Exported dataset with ${this.dataset.length} base entries and ${dbCount} DB diagrams.`,
      );
    } catch (dbError) {
      const errMsg =
        dbError instanceof Error ? dbError.message : String(dbError);
      this.logger.error(`Error fetching DB diagrams for export: ${errMsg}`);
    }

    return jsonlLines.join('\n');
  }

  // ─── Private helpers ────────────────────────────────────────────────

  /**
   * Simple TF-IDF cosine similarity for selecting the most relevant examples.
   */
  private selectBySimilarity(
    candidates: DatasetEntry[],
    query: string,
    limit: number,
  ): DatasetEntry[] {
    const queryTokens = this.tokenize(query);
    const queryTf = this.computeTf(queryTokens);

    // Build document frequency
    const allDocs = candidates.map((c) => this.tokenize(c.prompt));
    const df = this.computeDf(allDocs);
    const totalDocs = allDocs.length;

    // Score each candidate
    const scored = candidates.map((entry, idx) => {
      const docTf = this.computeTf(allDocs[idx]);
      const score = this.cosineSimilarity(queryTf, docTf, df, totalDocs);
      return { entry, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.entry);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-zà-üA-ZÀ-Ü0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);
  }

  private computeTf(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) || 0) + 1);
    }
    // Normalize
    const max = Math.max(...tf.values(), 1);
    for (const [k, v] of tf) {
      tf.set(k, v / max);
    }
    return tf;
  }

  private computeDf(docs: string[][]): Map<string, number> {
    const df = new Map<string, number>();
    for (const doc of docs) {
      const unique = new Set(doc);
      for (const t of unique) {
        df.set(t, (df.get(t) || 0) + 1);
      }
    }
    return df;
  }

  private cosineSimilarity(
    tf1: Map<string, number>,
    tf2: Map<string, number>,
    df: Map<string, number>,
    totalDocs: number,
  ): number {
    const allTerms = new Set([...tf1.keys(), ...tf2.keys()]);
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (const term of allTerms) {
      const idf = Math.log((totalDocs + 1) / ((df.get(term) || 0) + 1)) + 1;
      const v1 = (tf1.get(term) || 0) * idf;
      const v2 = (tf2.get(term) || 0) * idf;
      dotProduct += v1 * v2;
      mag1 += v1 * v1;
      mag2 += v2 * v2;
    }

    const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  private async saveDataset() {
    await fs.writeFile(this.datasetPath, JSON.stringify(this.dataset, null, 2));
  }

  private async createInitialDataset() {
    const initial: DatasetEntry[] = [
      {
        prompt:
          'Créer un diagramme de classe pour un système de gestion de bibliothèque avec Livre, Auteur et Emprunteur.',
        type: 'CLASS',
        mermaid:
          'classDiagram\n    class Livre\n    class Auteur\n    class Emprunteur\n    Livre --> Auteur : écrit par\n    Emprunteur --> Livre : emprunte',
      },
      {
        prompt:
          "Diagramme de cas d'utilisation pour une banque : le client retire de l'argent et consulte son solde.",
        type: 'USE_CASE',
        mermaid:
          'useCaseDiagram\n    actor Client\n    usecase "Retirer argent"\n    usecase "Consulter solde"\n    Client --> "Retirer argent"\n    Client --> "Consulter solde"',
      },
    ];
    this.dataset = initial;
    await this.saveDataset();
  }
}
