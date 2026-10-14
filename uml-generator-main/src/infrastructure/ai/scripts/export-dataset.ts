import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { DatasetService } from '../dataset.service';
import * as fs from 'fs/promises';
import { join } from 'path';

async function bootstrap() {
  console.log(
    '🛸 Booting NestJS context to export Llama 3 training dataset...',
  );

  // Creates standalone context without starting HTTP server
  const app = await NestFactory.createApplicationContext(AppModule);
  const datasetService = app.get(DatasetService);

  try {
    const jsonlContent = await datasetService.exportToLlama3Jsonl();

    // Ensure uploads folder exists
    const uploadsDir = join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const outputPath = join(uploadsDir, 'llama3_uml_dataset.jsonl');
    await fs.writeFile(outputPath, jsonlContent, 'utf8');

    console.log(`✅ Success! Dataset exported to: ${outputPath}`);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to export dataset: ${errMsg}`);
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error('Unhandled script error:', err);
  process.exit(1);
});
