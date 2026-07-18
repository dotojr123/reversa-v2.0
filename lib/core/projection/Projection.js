export class Projection {
    constructor(name, type = 'MATERIALIZED') {
        this.name = name;
        this.type = type; // 'MATERIALIZED' (ex: Markdown, Graph) ou 'DYNAMIC' (ex: REST, MCP)
    }

    /**
     * @param {Object} event { type: 'KNOWLEDGE_UPDATED'|'KNOWLEDGE_REMOVED', payload: KnowledgeObject }
     */
    async handleEvent(event) {
        throw new Error("Method not implemented.");
    }
    
    async supports(event) {
        return true;
    }
}
