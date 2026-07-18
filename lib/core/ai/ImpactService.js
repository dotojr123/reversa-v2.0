import { ImpactProvider } from '../interfaces/ImpactProvider.js';

export class ImpactService extends ImpactProvider {
    constructor(graphProvider) {
        super();
        this.graphiti = graphProvider;
    }

    async calculateImpact(canonicalId, options = { maxDepth: 3, confidenceThreshold: 0.7 }) {
        // Obter todo o grafo pra simular a query de vizinhança (mock em memória)
        const { results: allNodes, edges: allEdges } = await this.graphiti.query({ query: '' });

        const deterministicBlastRadius = [];
        const probabilisticRisks = [];
        const visited = new Set();
        
        // Fila de BFS: { id, depth, type: 'hard'|'soft', confidence: 1 }
        const queue = [{ id: canonicalId, depth: 0, edgeType: 'origin', confidence: 1.0 }];
        visited.add(canonicalId);

        while (queue.length > 0) {
            const current = queue.shift();

            if (current.depth >= options.maxDepth) continue;

            // Encontra arestas onde a 'source' ou 'target' se conecta ao current.id
            const connectedEdges = allEdges.filter(e => 
                (e.source === current.id || e.target === current.id)
            );

            for (const edge of connectedEdges) {
                const neighborId = edge.source === current.id ? edge.target : edge.source;
                
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    
                    const neighborNode = allNodes.find(n => (n.id || n.canonicalId) === neighborId);
                    const isHard = edge.type === 'CALLS' || edge.type === 'DEPENDS_ON'; // Hard edges
                    const isSoft = edge.type === 'RELATES_TO' || edge.type === 'SIMILAR_TO'; // Soft edges
                    
                    if (isHard) {
                        const impactItem = {
                            canonicalId: neighborId,
                            type: neighborNode?.type || 'UNKNOWN',
                            riskLevel: 'CRITICAL',
                            distance: current.depth + 1,
                            edgeType: 'hard',
                            reason: `Dependência estrutural direta via ${edge.type}`
                        };
                        deterministicBlastRadius.push(impactItem);
                        queue.push({ id: neighborId, depth: current.depth + 1, edgeType: 'hard', confidence: 1.0 });
                    } else if (isSoft) {
                        const confidence = edge.weight || 0.8;
                        if (confidence >= options.confidenceThreshold) {
                            const riskItem = {
                                canonicalId: neighborId,
                                type: neighborNode?.type || 'UNKNOWN',
                                riskLevel: 'WARNING',
                                distance: current.depth + 1,
                                edgeType: 'soft',
                                confidence: confidence,
                                reason: `Similaridade conceitual/episódica via ${edge.type}`
                            };
                            probabilisticRisks.push(riskItem);
                            queue.push({ id: neighborId, depth: current.depth + 1, edgeType: 'soft', confidence: confidence });
                        }
                    }
                }
            }
        }

        return {
            targetId: canonicalId,
            deterministicBlastRadius,
            probabilisticRisks
        };
    }
}
