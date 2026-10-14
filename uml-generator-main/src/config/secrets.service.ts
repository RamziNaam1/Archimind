import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecretsService {
  private readonly logger = new Logger(SecretsService.name);

  constructor(private configService: ConfigService) {}

  get databaseUrl(): string {
    return this.getOrThrow('DATABASE_URL');
  }

  get jwtSecret(): string {
    return this.getOrThrow('JWT_SECRET');
  }

  get jwtRefreshSecret(): string {
    return this.getOrThrow('JWT_REFRESH_SECRET');
  }

  get aiApiKey(): string | undefined {
    return this.configService.get<string>('AI_API_KEY');
  }

  get llamaBaseUrl(): string {
    return this.configService.get<string>(
      'LLAMA_BASE_URL',
      'http://localhost:11434',
    );
  }

  get llamaModel(): string {
    return this.configService.get<string>('LLAMA_MODEL', 'llama3-mermaid-uml');
  }

  get useLlama(): boolean {
    // Treat string representation from dotenv validation cleanly
    const val = this.configService.get<string | boolean>('USE_LLAMA', false);
    return val === true || val === 'true';
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3001);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  private getOrThrow(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      this.logger.error(`Critical secret "${key}" is missing!`);
      throw new Error(`Critical secret "${key}" is missing!`);
    }
    return value;
  }
}
