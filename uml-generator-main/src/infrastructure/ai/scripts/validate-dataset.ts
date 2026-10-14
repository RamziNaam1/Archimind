import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { DatasetService } from '../dataset.service';

async function bootstrap() {
  console.log('🔍 Booting NestJS context to validate dataset...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const datasetService = app.get(DatasetService);

  try {
    const stats = datasetService.getStats();
    console.log(`📊 Current Dataset Stats:`);
    console.log(`   - Total Entries: ${stats.total}`);
    console.log(`   - Average Prompt Length: ${stats.avgPromptLength} chars`);
    console.log(`   - Average Mermaid Length: ${stats.avgMermaidLength} chars`);
    console.log(`   - Distribution:`, JSON.stringify(stats.byType, null, 2));

    console.log('\n🧪 Running structural validation...');
    const validationResults = datasetService.validateAll();

    if (validationResults.length === 0) {
      console.log('✅ Success: All dataset entries are valid!');
    } else {
      console.error(`❌ Found ${validationResults.length} entries with validation errors:`);
      for (const res of validationResults) {
        console.error(`\n[Index ${res.index}] [Type: ${res.type}] Prompt: "${res.prompt}"`);
        res.errors.forEach((err) => console.error(`  - ${err}`));
      }
      process.exitCode = 1;
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Validation failed to run: ${errMsg}`);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error('Unhandled script error:', err);
  process.exit(1);
});
