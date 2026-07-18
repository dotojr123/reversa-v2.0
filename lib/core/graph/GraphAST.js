export class GraphAST {
    /**
     * O GraphAST abstrai operações e nós do Reversa KOS num formato independente de linguagem.
     * Os adaptadores de backend (Neo4j, Memgraph, Gremlin) consumirão este AST
     * para gerar as queries nativas (ex: Cypher).
     */
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.operations = [];
    }

    static fromGraphNode(graphNode) {
        return {
            id: graphNode.id,
            labels: graphNode.labels,
            properties: {
                canonicalId: graphNode.canonicalId,
                confidence: graphNode.confidence,
                version: graphNode.version,
                evidenceCount: graphNode.evidenceCount,
                ...graphNode.metadata,
                ...graphNode.properties
            }
        };
    }

    static fromGraphEdge(graphEdge) {
        return {
            id: graphEdge.id,
            source: graphEdge.source,
            target: graphEdge.target,
            type: graphEdge.type,
            properties: {
                weight: graphEdge.weight,
                confidence: graphEdge.confidence,
                evidenceCount: graphEdge.evidenceCount,
                ...graphEdge.properties
            }
        };
    }
}
