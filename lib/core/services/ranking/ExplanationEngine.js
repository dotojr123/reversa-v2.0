export class ExplanationEngine {
    /**
     * Retorna a árvore KOS-011 baseada nos metadados que foram anexados 
     * durante o processo de busca e ranking.
     */
    async explain(knowledgeArray, contextState) {
        if (!knowledgeArray || knowledgeArray.length === 0) return null;

        const explanationTree = {
            why: [],
            tree: {
                nodeId: "root-query",
                children: []
            },
            sources: new Set(),
            ranking: {},
            strategy: contextState.plan.planner
        };

        for (const item of knowledgeArray) {
            // Adiciona razões baseadas nos metadados de ranking
            if (item._rankingMetadata) {
                explanationTree.why.push(`Recuperado com score de ${item._rankingMetadata.score}`);
                // Merge breakdowns
                explanationTree.ranking = { ...explanationTree.ranking, ...item._rankingMetadata.breakdown };
            }
            
            // Constrói árvore visual (KOS-011)
            explanationTree.tree.children.push({
                type: item.type || 'KnowledgeObject',
                id: item.canonicalId || item.uuid
            });

            // Extrai sources
            if (item.evidence && Array.isArray(item.evidence)) {
                item.evidence.forEach(e => explanationTree.sources.add(e.file));
            }
        }

        // Transforma Set em Array
        explanationTree.sources = Array.from(explanationTree.sources);

        return explanationTree;
    }
}
