export class EpisodeGenerator {
  constructor({ queueProvider, graphitiProvider, inferenceProvider }) {
    this.queue = queueProvider;
    this.graphiti = graphitiProvider;
    this.inference = inferenceProvider; // Interface da IA
  }

  /**
   * @description Consome a fila de commits de conhecimento para gerar memórias episódicas
   */
  async processNextJob() {
    const job = await this.queue.dequeue();
    if (!job) return false;

    try {
      const { commitId, changeSet } = job.payload;
      
      let summary = "Sem resumo disponível (Inference indisponível)";
      let softEdges = [];
      
      if (this.inference) {
          summary = await this.inference.summarizeChangeSet(changeSet);
          softEdges = await this.inference.resolveSoftRelationships(changeSet);
      } else {
          // Dummy data when inference is not wired yet
          summary = `Mudanças detectadas: ${changeSet.addedNodes?.length || 0} nós adicionados, ${changeSet.updatedNodes?.length || 0} nós atualizados.`;
          // Create dummy soft edges
          softEdges = (changeSet.addedNodes || []).map(node => ({
              source: `EPISODE-${commitId}`,
              target: node.id || node.canonicalId,
              type: 'RELATES_TO',
              weight: 0.8
          }));
      }

      // KOS-017: Montagem do payload do Episódio Semântico
      const episodeData = {
        schemaVersion: "KOS-017",
        type: "EPISODE",
        id: `EPISODE-${commitId}`,
        content: {
          summary: summary,
          timestamp: new Date().toISOString()
        }
      };

      // Injeta na camada Soft do Graphiti
      await this.graphiti.saveEpisode(episodeData, softEdges);
      await this.queue.ack(job.id);
      return true;
    } catch (error) {
      await this.queue.retry(job.id, error);
      return false;
    }
  }
}
