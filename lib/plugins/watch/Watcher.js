import chokidar from 'chokidar';
import chalk from 'chalk';
import path from 'path';
import { createEvent, EventTypes } from '../../core/events/EventTypes.js';

export class Watcher {
    constructor(queueProvider, config = {}) {
        this.queue = queueProvider;
        this.projectRoot = config.projectRoot || process.cwd();
    }

    start() {
        console.log(chalk.cyan('Inicializando Reversa KOS Watch Mode...'));

        const ignoredPaths = [
            /(^|[\/\\])\../, 
            /node_modules/,
            /dist/,
            /build/
        ];

        this.watcher = chokidar.watch(this.projectRoot, {
            ignored: ignoredPaths,
            persistent: true,
            ignoreInitial: true
        });

        this.watcher
            .on('add', filePath => this.handleFileChange('add', filePath))
            .on('change', filePath => this.handleFileChange('change', filePath))
            .on('unlink', filePath => this.handleFileChange('unlink', filePath));

        console.log(chalk.green('✔ Watch mode ativado. Monitorando alterações via MemoryQueue...'));
    }

    async handleFileChange(action, filePath) {
        // Enqueue the raw event
        const event = createEvent(EventTypes.FILE_CHANGED, {
            action,
            path: path.relative(this.projectRoot, filePath),
            timestamp: Date.now()
        });

        await this.queue.enqueue(event);
        console.log(chalk.blue(`[WATCH] Evento enfileirado: ${action} -> ${event.path}`));
    }

    stop() {
        if (this.watcher) {
            this.watcher.close();
        }
    }
}
