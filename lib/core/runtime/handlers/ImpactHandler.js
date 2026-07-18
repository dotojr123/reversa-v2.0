/**
 * @class ImpactHandler
 * @description Handler do CommandBus/RequestRouter para processar análises de propagação.
 */
export class ImpactHandler {
  constructor({ impactService, rankingEngine }) {
    this.impactService = impactService;
    this.rankingEngine = rankingEngine;
  }

  /**
   * @param {Object} request - Envelope do RequestRouter
   * @param {string} request.type - 'ANALYZE_IMPACT'
   * @param {Object} request.payload - Payload KOS-008 adaptado para impacto
   * @returns {Promise<Object>} Resposta formatada KOS-018
   */
  async handle(request) {
    const { canonicalId, maxDepth, confidenceThreshold } = request.payload;

    if (!canonicalId) {
      throw new Error('[ImpactHandler] Atributo "canonicalId" é obrigatório.');
    }

    // Dispara o cálculo no motor recursivo (BFS) da Fase II
    const rawImpact = await this.impactService.calculateImpact(canonicalId, {
      maxDepth: maxDepth || 3,
      confidenceThreshold: confidenceThreshold || 0.7
    });

    // Pondera a criticidade e monta a Explanation Tree de Risco
    const finalReport = await this.rankingEngine.rank(rawImpact);

    return {
      status: 'SUCCESS',
      schemaVersion: 'KOS-018',
      payload: finalReport
    };
  }
}
