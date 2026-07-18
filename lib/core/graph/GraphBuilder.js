import { GraphNode } from '../models/GraphNode.js';
import { GraphEdge } from '../models/GraphEdge.js';
import { RelationshipResolver } from './RelationshipResolver.js';

export class GraphBuilder {
    /**
     * @param {KnowledgeObject} knowledgeObject 
     * @param {Object} knowledgeContext - Contexto global para resolução de arestas
     * @returns {Object} { nodes: [], edges: [] }
     */
    static build(knowledgeObject, knowledgeContext = null) {
        // 1. Resolve relações implícitas
        const resolvedKo = RelationshipResolver.resolve(knowledgeObject, knowledgeContext);

        const nodes = [];
        const edges = [];

        // 2. Cria o Nó Raiz
        const rootNode = new GraphNode({
            id: resolvedKo.uuid,
            canonicalId: resolvedKo.canonicalId,
            labels: ['Software', resolvedKo.type], // KOS-002 categorization
            properties: resolvedKo.content,
            metadata: { businessId: resolvedKo.businessId },
            confidence: resolvedKo.confidenceScore,
            version: resolvedKo.knowledgeVersion,
            evidenceCount: resolvedKo.evidences ? resolvedKo.evidences.length : 0
        });
        nodes.push(rootNode);

        // 3. Cria Arestas (Explícitas)
        if (resolvedKo.content.dependsOn) {
            resolvedKo.content.dependsOn.forEach(targetId => {
                edges.push(new GraphEdge({
                    source: rootNode.id,
                    target: targetId,
                    type: 'DEPENDS_ON',
                    confidence: rootNode.confidence,
                    evidenceCount: rootNode.evidenceCount
                }));
            });
        }

        // 4. Cria Arestas (Implícitas do Resolver)
        if (resolvedKo.content.inferredRelations) {
            resolvedKo.content.inferredRelations.forEach(rel => {
                edges.push(new GraphEdge({
                    source: rootNode.id,
                    target: rel.target,
                    type: rel.type,
                    confidence: rel.confidence || (rootNode.confidence * 0.8),
                    properties: { inferred: true }
                }));
            });
        }

        return { nodes, edges };
    }
}
