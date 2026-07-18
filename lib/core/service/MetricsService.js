export class MetricsService {
    constructor() {
        // Métricas Operacionais (Performance da plataforma)
        this.runtime = {
            queuePending: 0,
            queueProcessed: 0,
            cacheHits: 0,
            cacheMisses: 0,
            exportTimeMs: 0,
            graphSyncTimeMs: 0,
            latencyMs: 0,
            cpuUsagePercent: 0,
            memoryMb: 0
        };

        // Métricas de Domínio (Volume e saúde do conhecimento extraído)
        this.knowledge = {
            rules: 0,
            entities: 0,
            modules: 0,
            evidences: 0,
            conflictsOpen: 0,
            conflictsResolved: 0,
            graphNodes: 0,
            graphEdges: 0,
            canonicalIds: 0,
            avgConfidence: 0.0,
            coveragePercent: 0.0,
            mergeRate: 0.0,
            conflictRate: 0.0
        };
    }

    increment(metricName, value = 1) {
        if (this.runtime[metricName] !== undefined) {
            this.runtime[metricName] += value;
        } else if (this.knowledge[metricName] !== undefined) {
            this.knowledge[metricName] += value;
        }
    }

    set(metricName, value) {
        if (this.runtime[metricName] !== undefined) {
            this.runtime[metricName] = value;
        } else if (this.knowledge[metricName] !== undefined) {
            this.knowledge[metricName] = value;
        }
    }

    /**
     * Retorna o snapshot atual para o Dashboard (ex: comando `reversa status`)
     */
    getSnapshot() {
        return {
            runtime: { ...this.runtime },
            knowledge: { ...this.knowledge },
            timestamp: new Date().toISOString()
        };
    }
}
