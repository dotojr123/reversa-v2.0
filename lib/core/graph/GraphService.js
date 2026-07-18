import { GraphBuilder } from './GraphBuilder.js';
import { ArchitectureValidator } from './ArchitectureValidator.js';

export class GraphService {
    constructor(graphProvider, metricsService) {
        this.provider = graphProvider;
        this.metrics = metricsService;
    }

    /**
     * Ponto focal de entrada do Grafo. Recebe o KnowledgeObject finalizado pelo KnowledgeService.
     */
    async process(knowledgeObject, knowledgeContext) {
        // 1. Constrói a representação de grafo (com RelationshipResolver embutido)
        const { nodes, edges } = GraphBuilder.build(knowledgeObject, knowledgeContext);

        // 2. Valida a arquitetura antes de comitar no banco
        await ArchitectureValidator.validate(nodes, edges, this.provider);

        // 3. Persiste no GraphProvider via Transação
        if (this.provider) {
            try {
                await this.provider.beginTransaction();
                await this.provider.save(nodes, edges);
                await this.provider.commit();
                
                // Registra métricas de sucesso
                if (this.metrics) {
                    this.metrics.increment('graph_nodes', nodes.length);
                    this.metrics.increment('graph_edges', edges.length);
                }
            } catch (err) {
                await this.provider.rollback();
                throw err;
            }
        }

        return { nodes, edges };
    }
}
