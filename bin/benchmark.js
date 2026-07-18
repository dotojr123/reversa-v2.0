import path from 'path';
import { fileURLToPath } from 'url';
import ingestCommand from '../lib/commands/ingest.js';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runBenchmark() {
    console.log('--- REVERSA BENCHMARK ---');
    console.log('Objetivo: Rodar ingestão completa no próprio código fonte do Reversa');
    
    const targetDir = path.resolve(__dirname, '../lib');
    const dbPath = path.resolve(__dirname, '../.reversa/benchmark_knowledge.db');
    
    // Limpar DB de benchmark se existir
    try {
        await fs.unlink(dbPath);
    } catch(e) {}
    
    const start = performance.now();
    
    try {
        // Run without printing noise to console except from ingestCommand
        await ingestCommand(['--path', targetDir, '--mock-graph', '--db-path', dbPath]);
    } catch(e) {
        console.error('Falha no Ingest:', e);
    }
    
    const end = performance.now();
    const durationMs = end - start;
    
    console.log('\n--- RESULTADOS DO BENCHMARK ---');
    console.log(`Tempo total de ingestão: ${(durationMs / 1000).toFixed(2)} segundos`);
    console.log('-------------------------------');
}

runBenchmark();
