export class ArchitectureValidator {
    /**
     * Valida um sub-grafo (nodes e edges) construído ANTES de ir pro GraphProvider.
     * Pode usar queries no provider existente para checar integridade e ciclos.
     */
    static async validate(nodes, edges, graphProvider) {
        const errors = [];

        // 1. Checa arestas sem alvos conhecidos (nós órfãos ou desconexos)
        for (const edge of edges) {
            if (!edge.source || !edge.target) {
                errors.push(`Aresta ${edge.id} tem source ou target indefinido.`);
            }
        }

        // 2. Dependências Proibidas (Exemplo simples)
        // Se a policy de arquitetura diz que "Domain" não pode depender de "Infra"
        for (const edge of edges) {
            if (edge.type === 'DEPENDS_ON') {
                const sourceNode = nodes.find(n => n.id === edge.source);
                // alvo pode não estar neste sub-grafo, então precisamos do provider
                // Para a fase 2.5, deixaremos o hook pronto:
                if (sourceNode && sourceNode.labels.includes('Entity') && edge.properties?.layer === 'Infra') {
                    errors.push(`Violação Arquitetural: Entity ${sourceNode.id} não pode depender de Infra.`);
                }
            }
        }

        // 3. Ciclos simples no sub-grafo
        for (const edge of edges) {
            if (edge.source === edge.target) {
                errors.push(`Ciclo proibido no nó ${edge.source}`);
            }
        }

        if (errors.length > 0) {
            throw new Error(`Architecture Validation Failed:\n- ` + errors.join('\n- '));
        }

        return true;
    }
}
