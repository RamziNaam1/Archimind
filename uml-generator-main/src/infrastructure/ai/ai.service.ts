import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { SecretsService } from '@config/secrets.service';
import { DatasetService } from './dataset.service';
import { LlamaService } from './llama.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai?: OpenAI;

  constructor(
    private readonly secrets: SecretsService,
    private readonly datasetService: DatasetService,
    private readonly llamaService: LlamaService,
  ) {
    const apiKey = this.secrets.aiApiKey;
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    } else {
      this.logger.warn('AI_API_KEY is not defined. AI features limited.');
    }
  }

  async generateDiagramCode(prompt: string, type: string, context?: string): Promise<string> {
    if (this.secrets.useLlama) {
      return this.llamaService.generateDiagramCode(prompt, type);
    }

    if (!this.openai) {
      throw new Error('AI API (Groq) is not initialized.');
    }

    try {
      // Dans AiService.ts, modifie la partie du prompt :
// Remplace ton bloc de prompt dans AiService.ts par celui-ci :
const fullPrompt = `Tu es un expert UML. Ton travail est de produire UNIQUEMENT du code Mermaid.

${context ? `DIAGRAMME ACTUEL (À MODIFIER/COMPLÉTER, NE PAS SUPPRIMER LES CLASSES EXISTANTES) :
${context}
` : 'Ceci est un nouveau diagramme.'}

INSTRUCTION DE L'UTILISATEUR :
${prompt}

RÈGLES STRICTES :
1. PRODUIS UNIQUEMENT LE CODE MERMAID. PAS DE TEXTE. PAS DE MARKDOWN.
2. Si un DIAGRAMME ACTUEL est fourni, tu DOIS l'utiliser comme base et ajouter/modifier uniquement les éléments demandés par l'utilisateur.
3. NE SUPPRIME JAMAIS les classes ou relations présentes dans le DIAGRAMME ACTUEL, sauf si l'utilisateur demande explicitement de les retirer.
4. INTERDICTION ABSOLUE de créer des classes génériques comme 'Initial', 'Start', 'Workspace', 'Structure'.
5. Utilise uniquement des flèches standard (--> , -- , ..> , o-- , *--).
`;

      const completion = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: fullPrompt }],
        model: 'llama-3.3-70b-versatile',
      });

      let code = completion.choices[0].message.content?.trim() || '';
      return code.replace(/```mermaid/g, '').replace(/```/g, '').trim();
    } catch (error) {
      this.logger.error(`Erreur Groq: ${error}`);
      throw new Error("Impossible de générer le diagramme via l'IA.");
    }
  }
}