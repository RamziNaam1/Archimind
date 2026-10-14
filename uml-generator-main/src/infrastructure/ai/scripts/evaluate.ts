import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { AiService } from '../ai.service';
import { DatasetService, DatasetEntry } from '../dataset.service';
import { MermaidValidatorService } from '../../../modules/uml/mermaid-validator.service';

async function bootstrap() {
  console.log('🧪 Booting NestJS context to run evaluation pipeline...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const aiService = app.get(AiService);
  const datasetService = app.get(DatasetService);
  const validator = app.get(MermaidValidatorService);

  try {
    const dataset = datasetService.getAll();
    if (dataset.length === 0) {
      console.error('❌ Error: The dataset is empty. Cannot run evaluation.');
      process.exitCode = 1;
      return;
    }

    // Select 3 random/diverse entries for each diagram type for testing
    const types = ['CLASS', 'USE_CASE', 'SEQUENCE', 'ACTIVITY', 'ER'];
    const testSet: DatasetEntry[] = [];

    for (const type of types) {
      const typeEntries = dataset.filter((e) => e.type === type);
      // Take up to 3 entries
      const shuffled = [...typeEntries].sort(() => 0.5 - Math.random());
      testSet.push(...shuffled.slice(0, 3));
    }

    console.log(`\n📋 Running evaluation on ${testSet.length} test prompts...`);
    console.log('--------------------------------------------------');

    let successCount = 0;
    let totalTime = 0;
    const results: Array<{
      prompt: string;
      type: string;
      valid: boolean;
      timeMs: number;
      errors: string[];
    }> = [];

    for (let i = 0; i < testSet.length; i++) {
      const entry = testSet[i];
      console.log(`\n[${i + 1}/${testSet.length}] [${entry.type}] Prompt: "${entry.prompt}"`);

      const start = Date.now();
      let generatedCode = '';
      let isValid = false;
      let errors: string[] = [];
      let timeMs = 0;

      try {
        generatedCode = await aiService.generateDiagramCode(entry.prompt, entry.type);
        timeMs = Date.now() - start;
        totalTime += timeMs;

        const valResult = validator.validate(generatedCode, entry.type);
        isValid = valResult.valid;
        errors = valResult.errors;

        if (isValid) {
          successCount++;
          console.log(`  ✅ Valid Mermaid diagram generated in ${timeMs}ms`);
        } else {
          console.error(`  ❌ Invalid Mermaid diagram! (in ${timeMs}ms)`);
          errors.forEach((err) => console.error(`    - ${err}`));
        }
      } catch (err) {
        timeMs = Date.now() - start;
        totalTime += timeMs;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  ❌ Generation failed: ${msg}`);
        errors = [msg];
      }

      results.push({
        prompt: entry.prompt,
        type: entry.type,
        valid: isValid,
        timeMs,
        errors,
      });
    }

    // Print summary report
    const successRate = Math.round((successCount / testSet.length) * 100);
    const avgTime = Math.round(totalTime / testSet.length);

    console.log('\n==================================================');
    console.log('📊 EVALUATION SUMMARY REPORT');
    console.log('==================================================');
    console.log(`- Total Evaluated: ${testSet.length}`);
    console.log(`- Successfully Valid: ${successCount} / ${testSet.length} (${successRate}%)`);
    console.log(`- Average Latency: ${avgTime}ms`);
    console.log('--------------------------------------------------');

    const byTypeStats: Record<string, { total: number; valid: number }> = {};
    for (const res of results) {
      if (!byTypeStats[res.type]) {
        byTypeStats[res.type] = { total: 0, valid: 0 };
      }
      byTypeStats[res.type].total++;
      if (res.valid) {
        byTypeStats[res.type].valid++;
      }
    }

    console.log('Stats by Diagram Type:');
    for (const [type, data] of Object.entries(byTypeStats)) {
      const typeRate = Math.round((data.valid / data.total) * 100);
      console.log(`  - ${type}: ${data.valid}/${data.total} valid (${typeRate}%)`);
    }
    console.log('==================================================');

    if (successRate < 80) {
      console.warn('\n⚠️ Warning: Validity rate is below 80%. Check logs/prompts.');
    }

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Evaluation script failed to run: ${errMsg}`);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error('Unhandled script error:', err);
  process.exit(1);
});
