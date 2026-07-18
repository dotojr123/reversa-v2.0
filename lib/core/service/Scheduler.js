export class Scheduler {
    /**
     * Gerencia fila de eventos do Watcher aplicando Debounce, Batching e Retry
     * antes de enviá-los para o SyncEngine.
     */
    constructor(syncEngine, options = {}) {
        this.syncEngine = syncEngine;
        this.batch = [];
        this.debounceTime = options.debounceTime || 500; // ms
        this.maxRetries = options.maxRetries || 3;
        this.timer = null;
    }

    /**
     * Recebe arquivo(s) modificado(s) do Watcher
     */
    schedule(knowledgeObject) {
        this.batch.push(knowledgeObject);

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => this.flush(), this.debounceTime);
    }

    async flush() {
        if (this.batch.length === 0) return;

        const currentBatch = [...this.batch];
        this.batch = []; // libera a fila para novos eventos

        for (const ko of currentBatch) {
            await this._processWithRetry(ko, 0);
        }
    }

    async _processWithRetry(knowledgeObject, attempt) {
        try {
            await this.syncEngine.sync(knowledgeObject, null); // Context omitido aqui
        } catch (error) {
            console.error(`[Scheduler] Sync failed for ${knowledgeObject.canonicalId || knowledgeObject.uuid}:`, error.message);
            if (attempt < this.maxRetries) {
                console.log(`[Scheduler] Retrying... (${attempt + 1}/${this.maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                await this._processWithRetry(knowledgeObject, attempt + 1);
            } else {
                console.error(`[Scheduler] Max retries reached for ${knowledgeObject.canonicalId || knowledgeObject.uuid}.`);
                // Poderíamos enviar para uma DLQ (Dead Letter Queue)
            }
        }
    }
}
