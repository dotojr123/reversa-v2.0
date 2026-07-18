import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { Scanner } from '../core/scanner/Scanner.js';
import { KnowledgeEngine } from '../core/engine/KnowledgeEngine.js';
import { GraphSyncEngine } from '../core/graph/GraphSyncEngine.js';
import { GraphIndex } from '../core/graph/GraphIndex.js';
import { GraphitiProvider } from '../plugins/graph/graphiti/GraphitiProvider.js';
import { SQLiteQueueProvider } from '../plugins/queue/SQLiteQueueProvider.js';
import { EpisodeGenerator } from '../core/episodes/EpisodeGenerator.js';
import { KnowledgeVersionEngine } from '../core/versioning/KnowledgeVersionEngine.js';
import { SQLiteStorage } from '../core/storage/SQLiteStorage.js';
import chalk from 'chalk';
import ora from 'ora';

async function findJsFiles(dir, fileList = []) {
    const files = await fs.readdir(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            await findJsFiles(filePath, fileList);
        } else if (file.endsWith('.js')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

export default async function ingestCommand(args) {
    const pathArgIndex = args.indexOf('--path');
    if (pathArgIndex === -1 || !args[pathArgIndex + 1]) {
        console.error(chalk.red('Error: missing --path argument.'));
        process.exit(1);
    }
    const targetDir = path.resolve(args[pathArgIndex + 1]);

    const spinner = ora('Inicializando KOS...').start();
    
    const dbPathIndex = args.indexOf('--db-path');
    const dbPath = dbPathIndex !== -1 && args[dbPathIndex + 1] ? args[dbPathIndex + 1] : '.reversa/knowledge.db';
    
    // 1. Storage e Repositórios
    const sqliteStorage = new SQLiteStorage(dbPath);
    await sqliteStorage.init();
    
    const versionEngine = new KnowledgeVersionEngine(sqliteStorage);
    await versionEngine.init();
    
    const memoryRepo = {
        store: new Map(), // canonicalId -> ko
        async getById(id) { return this.store.get(id); },
        async save(ko) { this.store.set(ko.canonicalId, ko); },
        async delete(id) { this.store.delete(id); },
        async findByHashOrCanonical(hash, canonicalId) {
            return this.store.get(canonicalId);
        }
    };
    const knowledgeEngine = new KnowledgeEngine(memoryRepo);
    
    const queueProvider = new SQLiteQueueProvider(dbPath.replace('.db', '_queue.db'));
    await queueProvider.init();
    
    const graphProvider = new GraphitiProvider();
    const graphIndex = new GraphIndex();
    const graphSyncEngine = new GraphSyncEngine(graphProvider, graphIndex, null, queueProvider);
    spinner.text = 'Buscando arquivos...';
    const files = await findJsFiles(targetDir);
    
    const scanner = new Scanner(targetDir);
    
    let totalKOs = 0;
    
    const allChangeSets = {
        addedNodes: [],
        updatedNodes: [],
        removedNodes: [],
        addedEdges: [],
        updatedEdges: [],
        removedEdges: []
    };

    spinner.text = 'Ingerindo código...';
    for (const file of files) {
        // 1. Scan
        const rawObjects = await scanner.scan(file);
        
        // 2. Process & Graph Build
        for (const raw of rawObjects) {
            // Converter RawKnowledgeObject para formato esperado pelo KOS-001 Validation
            raw.uuid = crypto.randomUUID();
            raw.confidenceScore = 90;
            if (raw.evidences) {
                raw.evidences.forEach(e => e.id = crypto.randomUUID());
            }
            
            const finalKo = await knowledgeEngine.process(raw);
            
            // Só sincroniza e comita após deduplicação/conflito resolvido
            // Para simplificar, o sync retorna um changeset para esse KO
            const changeSet = await graphSyncEngine.sync(finalKo, {});
            
            // Agrupar para o commit final
            allChangeSets.addedNodes.push(...changeSet.addedNodes);
            allChangeSets.updatedNodes.push(...changeSet.updatedNodes);
            allChangeSets.removedNodes.push(...changeSet.removedNodes);
            allChangeSets.addedEdges.push(...changeSet.addedEdges);
            allChangeSets.updatedEdges.push(...changeSet.updatedEdges);
            allChangeSets.removedEdges.push(...changeSet.removedEdges);
            
            totalKOs++;
        }
    }
    
    spinner.text = 'Atualizando índices textuais (FTS5)...';
    for (const node of [...allChangeSets.addedNodes, ...allChangeSets.updatedNodes]) {
        await sqliteStorage.execute(
            `INSERT OR REPLACE INTO knowledge_fts (canonicalId, type, content) VALUES (?, ?, ?)`,
            [node.canonicalId || node.id, node.type || 'UNKNOWN', JSON.stringify(node.content || {})]
        );
    }

    spinner.text = 'Gerando commit KOS-015...';
    
    // 3. Commit
    const commit = await versionEngine.commit(allChangeSets, 'reversa-ingest', 'Initial ingestion');
    
    spinner.succeed(`[Fast Lane] ✓ Ingestão completa! Commit ID: ${commit.id}`);
    console.log(chalk.green(`  Total de Arquivos: ${files.length}`));
    console.log(chalk.green(`  Knowledge Objects extraídos: ${totalKOs}`));
    console.log(chalk.green(`  Nós AST Adicionados no Graphiti: ${allChangeSets.addedNodes.length}`));
    console.log(chalk.green(`  Arestas Hard Adicionadas no Graphiti: ${allChangeSets.addedEdges.length}`));

    // 4. Slow Lane Daemon Simulation
    console.log(chalk.blue(`\n[Slow Lane] [Fila] Iniciando processamento de Episódios em background...`));
    const episodeGenerator = new EpisodeGenerator({
        queueProvider: queueProvider,
        graphitiProvider: graphProvider,
        inferenceProvider: null // mock for now
    });

    let processedJobs = 0;
    while (await queueProvider.size() > 0) {
        const success = await episodeGenerator.processNextJob();
        if (success) processedJobs++;
    }

    if (processedJobs > 0) {
        console.log(chalk.blue(`[Slow Lane] [IA] ${processedJobs} episódios semânticos gerados com sucesso no Graphiti.`));
    }

    if (graphProvider.disconnect) await graphProvider.disconnect();
    await sqliteStorage.close();
}
