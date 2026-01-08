#!/usr/bin/env node
/**
 * CLI tool for importing testaferros data
 * 
 * Usage:
 *   pnpm tsx scripts/import-testaferros.ts --file path/to/data.csv
 *   pnpm tsx scripts/import-testaferros.ts --file path/to/data.json
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { TestaferroIngestionService } from '../src/modules/ingestion/testaferro-ingestion.service';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ingestionService = app.get(TestaferroIngestionService);

  const args = process.argv.slice(2);
  const fileIndex = args.indexOf('--file');

  if (fileIndex === -1 || !args[fileIndex + 1]) {
    console.error('Usage: pnpm tsx scripts/import-testaferros.ts --file <path>');
    process.exit(1);
  }

  const filePath = args[fileIndex + 1];
  const absolutePath = path.isAbsolute(filePath) 
    ? filePath 
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const ext = path.extname(absolutePath).toLowerCase();

  console.log(`🚀 Starting import from ${absolutePath}...`);

  try {
    let result;

    if (ext === '.csv') {
      result = await ingestionService.importFromCsv(absolutePath);
    } else if (ext === '.json') {
      const data = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
      result = await ingestionService.importFromJson(data);
    } else {
      console.error('Unsupported file format. Use .csv or .json');
      process.exit(1);
    }

    console.log('\n✅ Import Complete!');
    console.log(`   Imported: ${result.imported}`);
    console.log(`   Failed: ${result.failed}`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(err => console.log(`   - ${err}`));
    }

    // Show stats
    const stats = await ingestionService.getImportStats();
    console.log('\n📊 Database Statistics:');
    console.log(`   Total Testaferros: ${stats.totalTestaferros}`);
    console.log(`   With Official Links: ${stats.withOfficialLinks}`);
    console.log(`   Without Links: ${stats.withoutOfficialLinks}`);
    console.log('\n   By Confidence Level:');
    Object.entries(stats.byConfidenceLevel).forEach(([level, count]) => {
      const stars = '⭐'.repeat(parseInt(level));
      console.log(`   ${stars} Level ${level}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
