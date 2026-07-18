import { GraphChangeSet } from './GraphChangeSet.js';
import { GraphBuilder } from './GraphBuilder.js';

export class GraphSyncEngine {
    constructor(graphProvider, graphIndex, metricsService, queueProvider) {
        this.provider = graphProvider;
        this.index = graphIndex;
        this.metrics = metricsService;
        this.queueProvider = queueProvider;
    }

    /**
     * Ponto de entrada do Sincronismo Incremental
     */
    async sync(knowledgeObject, knowledgeContext) {
        // 1. Planner: Calcula Diff
        const changeSet = await this._plan(knowledgeObject, knowledgeContext);

        // 2. Executor: Aplica o Diff no Provider
        await this._execute(changeSet);

        // 3. Commit: Atualiza Índices e Métricas
        await this._commit(knowledgeObject, changeSet);

        // 4. Slow Lane: Enfileira para geração de Episódio Semântico
        if (this.queueProvider && (changeSet.addedNodes.length > 0 || changeSet.updatedNodes.length > 0)) {
            await this.queueProvider.enqueue({
                type: 'GENERATE_EPISODE',
                payload: {
                    commitId: knowledgeContext?.commitId || Date.now().toString(),
                    changeSet: changeSet
                }
            });
        }

        return changeSet;
    }

    /**
     * Fase 1: Planner (Faz o diff)
     */
    async _plan(knowledgeObject, knowledgeContext) {
        const changeSet = new GraphChangeSet();
        const { nodes, edges } = GraphBuilder.build(knowledgeObject, knowledgeContext);

        for (const node of nodes) {
            const existingNodeId = this.index.getNodeId(node.canonicalId);
            if (existingNodeId) {
                // Em produção faríamos deep diff para saber se update é necessário.
                // Simulando diff lógico aqui:
                node.id = existingNodeId; // mantém o id
                changeSet.updatedNodes.push(node);
                // changeSet.unchangedNodes++;
            } else {
                changeSet.addedNodes.push(node);
            }
        }

        // Simplificação: no futuro consultaríamos o Grafo atual para fazer diff de arestas
        for (const edge of edges) {
            changeSet.addedEdges.push(edge);
        }

        return changeSet;
    }

    /**
     * Fase 2: Executor
     */
    async _execute(changeSet) {
        if (!this.provider) return;
        
        try {
            if (changeSet.addedNodes.length > 0 || changeSet.updatedNodes.length > 0) {
                const nodesToSave = [...changeSet.addedNodes, ...changeSet.updatedNodes];
                await this.provider.bulkSaveNodes(nodesToSave);
            }

            if (changeSet.addedEdges.length > 0 || changeSet.updatedEdges.length > 0) {
                const edgesToSave = [...changeSet.addedEdges, ...changeSet.updatedEdges];
                await this.provider.bulkSaveEdges(edgesToSave);
            }

            // A remoção seria tratada no Provider, omitimos para foco na Sprint 7
        } catch (err) {
            throw err;
        }
    }

    /**
     * Fase 3: Commit (Métricas e Indexes)
     */
    async _commit(knowledgeObject, changeSet) {
        // Atualizar index de nós recém adicionados
        for (const node of changeSet.addedNodes) {
            if (node.canonicalId) {
                await this.index.setNodeId(node.canonicalId, node.id);
            }
        }
        for (const node of changeSet.removedNodes) {
            if (node.canonicalId) {
                await this.index.remove(node.canonicalId);
            }
        }

        if (this.metrics) {
            const stats = changeSet.getStats();
            this.metrics.increment('graphNodes', stats.nodes.added - stats.nodes.removed);
            this.metrics.increment('graphEdges', stats.edges.added - stats.edges.removed);
        }
    }
}
