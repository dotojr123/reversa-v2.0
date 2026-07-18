export class KnowledgeOptimizer {
    constructor(capabilityManager) {
        this.capabilityManager = capabilityManager;
    }

    /**
     * Transforma um Logical Plan gerado pelo RetrievalPlanner em um Physical DAG executável.
     */
    optimize(logicalPlan) {
        const sysCaps = this.capabilityManager.getSystemCapabilities();
        const physicalDag = {
            id: 'dag-' + Date.now(),
            parallel: [], // Nodes that can run concurrently (e.g., Keyword & Graph)
            sequential: [] // Nodes that must run after (e.g., Ranking & Explanation)
        };

        // Capability Negotiation para otimização
        for (const step of logicalPlan.pipeline) {
            if (step === 'keyword' && sysCaps.retrieval.keyword) {
                physicalDag.parallel.push({ type: 'SEARCH_KEYWORD' });
            }
            if (step === 'graph' && sysCaps.retrieval.graph) {
                physicalDag.parallel.push({ type: 'SEARCH_GRAPH' });
            }
            if (step === 'ranking') {
                physicalDag.sequential.push({ type: 'MERGE_AND_RANK' });
            }
            if (step === 'explanation') {
                physicalDag.sequential.push({ type: 'GENERATE_EXPLANATION' });
            }
        }

        // Se o plano lógico pediu coisas não suportadas pelo Runtime atual, 
        // o Optimizer silenciosamente descarta a etapa (Graceful Degradation).
        return physicalDag;
    }

    /**
     * Executa o Physical DAG usando concorrência assíncrona.
     */
    async executeDag(dag, query, engines) {
        // 1. Executa Buscas em Paralelo
        const parallelPromises = dag.parallel.map(async (node) => {
            if (node.type === 'SEARCH_KEYWORD') return engines.keyword.search(query);
            if (node.type === 'SEARCH_GRAPH') return engines.graph.search(query);
            return [];
        });

        const parallelResults = await Promise.all(parallelPromises);
        let mergedKnowledge = parallelResults.flat();

        // 2. Executa passos sequenciais
        for (const node of dag.sequential) {
            if (node.type === 'MERGE_AND_RANK') {
                // Remove duplicatas e Ranqueia
                mergedKnowledge = await engines.ranking.rank(mergedKnowledge);
            }
            if (node.type === 'GENERATE_EXPLANATION') {
                // Anexa as explicações
                mergedKnowledge = await engines.explanation.explain(mergedKnowledge);
            }
        }

        return mergedKnowledge;
    }
}
