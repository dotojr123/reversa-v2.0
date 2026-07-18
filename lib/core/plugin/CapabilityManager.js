export class CapabilityManager {
    constructor(lifecycleManager) {
        this.lifecycleManager = lifecycleManager;
    }

    /**
     * Mescla todas as capabilities dos plugins ativos no estado READY.
     * Resolve de forma hierárquica (ex: graph.enabled, graph.transactions).
     */
    getSystemCapabilities() {
        const sysCaps = {
            graph: { enabled: false, transactions: false, temporal: false, shortestPath: false, batch: false },
            retrieval: { keyword: false, graph: false, semantic: false, hybrid: false }
        };

        for (const [id, p] of this.lifecycleManager.plugins.entries()) {
            if (p.state === 'READY' && p.capabilities) {
                // Merge Graph Capabilities
                if (p.capabilities.graph) {
                    sysCaps.graph.enabled = sysCaps.graph.enabled || p.capabilities.graph.enabled;
                    sysCaps.graph.transactions = sysCaps.graph.transactions || p.capabilities.graph.transactions;
                    sysCaps.graph.temporal = sysCaps.graph.temporal || p.capabilities.graph.temporal;
                    sysCaps.graph.shortestPath = sysCaps.graph.shortestPath || p.capabilities.graph.shortestPath;
                    sysCaps.graph.batch = sysCaps.graph.batch || p.capabilities.graph.batch;
                }
                // Merge Retrieval Capabilities
                if (p.capabilities.retrieval) {
                    sysCaps.retrieval.keyword = sysCaps.retrieval.keyword || p.capabilities.retrieval.keyword;
                    sysCaps.retrieval.graph = sysCaps.retrieval.graph || p.capabilities.retrieval.graph;
                    sysCaps.retrieval.semantic = sysCaps.retrieval.semantic || p.capabilities.retrieval.semantic;
                    sysCaps.retrieval.hybrid = sysCaps.retrieval.hybrid || p.capabilities.retrieval.hybrid;
                }
            }
        }
        return sysCaps;
    }
}
