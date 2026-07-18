export class ContextAssembly {
    /**
     * O ContextAssembly recebe os KnowledgeObjects retornados pelo Search 
     * e os agrupa no modelo estruturado KOS-010 para entrega aos LLMs.
     */
    assemble(knowledgeResponse) {
        const context = {
            rules: [],
            modules: [],
            entities: [],
            apis: [],
            graph: [],
            evidence: [],
            summary: "",
            confidence: 0
        };

        if (!knowledgeResponse || !knowledgeResponse.knowledge) {
            return context;
        }

        let totalConfidence = 0;
        let count = 0;

        // Classificação e Agrupamento
        for (const item of knowledgeResponse.knowledge) {
            const type = (item.type || 'unknown').toLowerCase();
            
            if (type === 'rule' || type === 'businessrule') {
                context.rules.push(item);
            } else if (type === 'module' || type === 'package') {
                context.modules.push(item);
            } else if (type === 'entity' || type === 'table') {
                context.entities.push(item);
            } else if (type === 'api' || type === 'endpoint') {
                context.apis.push(item);
            }

            if (item.evidence) {
                context.evidence.push(...item.evidence);
            }

            if (item.confidence) {
                totalConfidence += item.confidence;
                count++;
            }
        }

        // Subgrafo em formato de texto para LLMs entenderem
        if (knowledgeResponse.graph && knowledgeResponse.graph.edges) {
            context.graph = knowledgeResponse.graph.edges.map(e => 
                `${e.source} --[${e.type}]--> ${e.target}`
            );
        }

        context.confidence = count > 0 ? (totalConfidence / count) : 0;
        context.summary = `Context assembled with ${knowledgeResponse.knowledge.length} items. Avg confidence: ${(context.confidence * 100).toFixed(1)}%`;

        return context;
    }
}
