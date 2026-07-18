/**
 * @interface GraphProvider
 * @description Contrato canônico para persistência e consulta no grafo unificado do Reversa KIP.
 */
export class GraphProvider {
  // Fast Lane (Síncrono) - Operações em Lote para AST
  async bulkSaveNodes(nodes) { throw new Error('Not Implemented'); }
  async bulkSaveEdges(edges) { throw new Error('Not Implemented'); }
  
  // Slow Lane (Assíncrono) - Operações Semânticas/Episódicas
  async saveEpisode(episodeNode, softEdges) { throw new Error('Not Implemented'); }
  
  // Queries Unificadas (Usadas pela KAL e pelo MCP)
  async query(kosQueryModel) { throw new Error('Not Implemented'); }
  
  // Infra/Lifecycle
  async health() { throw new Error('Not Implemented'); }
}
