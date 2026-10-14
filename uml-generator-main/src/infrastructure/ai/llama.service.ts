import { Injectable, Logger } from '@nestjs/common';
import { SecretsService } from '@config/secrets.service';

@Injectable()
export class LlamaService {
  private readonly logger = new Logger(LlamaService.name);

  constructor(private readonly secrets: SecretsService) {}

  /**
   * Checks if the Llama service server is reachable and running.
   */
  async checkHealth(): Promise<boolean> {
    try {
      const isOllama =
        this.secrets.llamaBaseUrl.includes('11434') ||
        !this.secrets.llamaBaseUrl.includes('/v1');
      const baseUrl = this.secrets.llamaBaseUrl.replace(/\/$/, '');
      const url = isOllama ? `${baseUrl}/api/tags` : `${baseUrl}/models`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Llama service health check failed: ${msg}`);
      return false;
    }
  }

  async generateDiagramCode(prompt: string, type: string): Promise<string> {
    try {
      const systemInstruction =
        `You are an expert UML and Mermaid.js designer. ` +
        `Generate a valid Mermaid.js diagram of type ${type} based on the user's description. ` +
        `Do NOT include any markdown formatting (like \`\`\`mermaid or \`\`\`), HTML tags, explanations, or notes. ` +
        `Output ONLY the raw Mermaid.js code. ` +
        `Make sure the code starts directly with the correct Mermaid keyword (e.g. classDiagram, sequenceDiagram, erDiagram, usecaseDiagram, stateDiagram-v2).`;

      // Llama 3 Instruct Format
      const llama3Prompt =
        `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n` +
        `${systemInstruction}<|eot_id|>` +
        `<|start_header_id|>user<|end_header_id|>\n\n` +
        `${prompt}<|eot_id|>` +
        `<|start_header_id|>assistant<|end_header_id|>\n\n`;

      const isOllama =
        this.secrets.llamaBaseUrl.includes('11434') ||
        !this.secrets.llamaBaseUrl.includes('/v1');
      const url = isOllama
        ? `${this.secrets.llamaBaseUrl.replace(/\/$/, '')}/api/generate`
        : `${this.secrets.llamaBaseUrl.replace(/\/$/, '')}/chat/completions`;

      let generatedCode = '';

      if (isOllama) {
        // Ollama API
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.secrets.llamaModel,
            prompt: llama3Prompt,
            stream: false,
            options: {
              temperature: 0.2,
              stop: ['<|eot_id|>'],
              num_predict: 2048,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama response error: ${response.statusText}`);
        }

        const data = (await response.json()) as { response: string };
        generatedCode = data.response || '';
      } else {
        // OpenAI / vLLM API
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.secrets.llamaModel,
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt },
            ],
            temperature: 0.2,
            max_tokens: 2048,
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`vLLM response error: ${response.statusText}`);
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        generatedCode = data.choices?.[0]?.message?.content || '';
      }

      // Cleanup generated output from any extra markdown blocks
      generatedCode = generatedCode
        .replace(/```mermaid/g, '')
        .replace(/```/g, '')
        .trim();
      return generatedCode;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error querying Llama 3 model: ${message}`);
      throw new Error(`Llama 3 generation failed: ${message}`);
    }
  }
}
