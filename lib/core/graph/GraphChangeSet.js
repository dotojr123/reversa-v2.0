export class GraphChangeSet {
    constructor() {
        this.addedNodes = [];
        this.updatedNodes = [];
        this.removedNodes = [];
        this.unchangedNodes = 0; // Para métricas

        this.addedEdges = [];
        this.updatedEdges = [];
        this.removedEdges = [];
        this.unchangedEdges = 0; // Para métricas
    }

    /**
     * Retorna estatísticas sumárias do diff
     */
    getStats() {
        return {
            nodes: {
                added: this.addedNodes.length,
                updated: this.updatedNodes.length,
                removed: this.removedNodes.length,
                unchanged: this.unchangedNodes
            },
            edges: {
                added: this.addedEdges.length,
                updated: this.updatedEdges.length,
                removed: this.removedEdges.length,
                unchanged: this.unchangedEdges
            }
        };
    }
}
