import chalk from 'chalk';
import { CapabilityRegistry } from '../plugins/registry/CapabilityRegistry.js';
import { SQLiteProvider } from '../plugins/storage/sqlite/SQLiteProvider.js';
import { MemoryQueue } from '../plugins/queue/memory/MemoryQueue.js';
import { KnowledgeRepository } from '../core/repository/KnowledgeRepository.js';

export default async function statusCommand(args) {
    console.log(chalk.cyan('Reversa KOS - Status\n'));

    // Mock/Bootstrap minimal for status check
    const registry = new CapabilityRegistry();
    const queue = new MemoryQueue();
    
    // Attempt DB connect to check status
    const sqlite = new SQLiteProvider();
    
    let dbStatus = chalk.green('OK');
    try {
        await sqlite.connect({ dbPath: '.reversa/knowledge.db' });
    } catch (e) {
        dbStatus = chalk.red('Offline/Error');
    }

    console.log(`Projeto: ${chalk.white.bold('ERP (Mock)')}`);
    console.log('--------------------------------');
    console.log(`Knowledge DB: ${dbStatus}`);
    console.log(`Schema Version: ${chalk.yellow('1.0')}`);
    console.log(`Watcher: ${chalk.green('Running (Simulated)')}`);
    console.log(`Pending Jobs: ${await queue.size()}`);
    console.log(`Graph Provider: ${chalk.gray('Disabled')}`);
    console.log(`MCP Server: ${chalk.gray('Disabled')}`);
    console.log('--------------------------------');

    if (sqlite.db) {
        sqlite.db.get("SELECT count(*) as count FROM knowledge_objects", (err, row) => {
            if (!err) {
                console.log(`Knowledge Objects: ${chalk.blue(row.count)}`);
            }
            sqlite.disconnect();
        });
    }
}
