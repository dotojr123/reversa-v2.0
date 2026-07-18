import { CapabilityRegistry } from '../plugins/registry/CapabilityRegistry.js';
import { SQLiteProvider } from '../plugins/storage/sqlite/SQLiteProvider.js';
import { MemoryQueue } from '../plugins/queue/memory/MemoryQueue.js';
import { Watcher } from '../plugins/watch/Watcher.js';

export default async function watchCommand(args) {
    const registry = new CapabilityRegistry();
    
    const sqlite = new SQLiteProvider();
    await sqlite.connect({ dbPath: '.reversa/knowledge.db' });
    registry.register('StorageProvider', sqlite);
    
    const queue = new MemoryQueue();
    registry.register('QueueProvider', queue);

    const watcher = new Watcher(queue, { projectRoot: process.cwd() });
    watcher.start();

    // Loop simples para processar a fila em background
    setInterval(async () => {
        const job = await queue.dequeue();
        if (job) {
            // Em uma implementação completa, a Queue acionaria o Pipeline -> KnowledgeCore
            // Para a Fase 1 simplificada, apenas demonstramos o desacoplamento.
            console.log(`[QUEUE] Processando Job:`, job.type, job.path);
        }
    }, 1000);

    process.on('SIGINT', async () => {
        console.log('\nEncerrando Watch Mode e Storage...');
        watcher.stop();
        await sqlite.disconnect();
        process.exit(0);
    });
}
