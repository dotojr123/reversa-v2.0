export class ProjectionScheduler {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.projections = []; // Registrados via engine
    }

    registerProjection(projectionEngine) {
        this.projections.push(projectionEngine);
    }

    async schedule(commit) {
        this.queue.push(commit);
        console.log(`[ProjectionScheduler] Commit ${commit.id} enfileirado para projeção.`);
        this.processQueue(); // Fire and forget para não bloquear o Kernel
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const commit = this.queue.shift();
            try {
                // Roda todas as engines de projeção conectadas (ex: MarkdownProjection, JsonProjection)
                await Promise.all(this.projections.map(p => p.project(commit)));
                console.log(`[ProjectionScheduler] Projeções concluídas para o Commit ${commit.id}`);
            } catch (error) {
                console.error(`[ProjectionScheduler] Falha projetando Commit ${commit.id}:`, error);
                // DLQ ou retry backoff logic goes here
            }
        }
        
        this.isProcessing = false;
    }
}
