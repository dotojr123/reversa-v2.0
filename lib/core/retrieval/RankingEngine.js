/**
 * @class RankingEngine
 * @description Consolida, pontua e gera justificativas rastreáveis para os resultados.
 */
export class RankingEngine {
  /**
   * @param {Array} rawResults - Resultados mistos vindos do QueryPlanner
   * @returns {Object} Conforme KOS-009 e KOS-011 (Top 10 + Explanation Tree)
   */
  async rank(rawResults) {
    const scoredMap = new Map();

    for (const item of rawResults) {
      let score = 0;
      const reasons = [];

      // Se o item foi capturado por ambas as pontas (Léxica e Semântica), ganha bônus
      if (item.fromFts) {
        score += (item.ftsScore || 1) * 0.4;
        reasons.push(`Correspondência léxica exata (FTS Score: ${item.ftsScore})`);
      }
      if (item.fromGraphiti) {
        // Assume lower distance is better, or higher similarity is better.
        // For simplicity, we just add it if semanticDistance exists.
        const sd = item.semanticDistance || 0.8; 
        score += sd * 0.6;
        reasons.push(`Similaridade conceitual no grafo (Score: ${sd.toFixed(2)})`);
      }

      // Penalidade temporal por obsolescência (KOS-016)
      // If we don't have an updatedAt, we default to 0 penalty
      const ageInDays = item.updatedAt ? (Date.now() - new Date(item.updatedAt).getTime()) / (1000 * 60 * 60 * 24) : 0;
      const temporalFactor = Math.exp(-0.01 * ageInDays); // Decaimento suave
      score *= temporalFactor;

      scoredMap.set(item.canonicalId, {
        ...item,
        finalScore: score,
        explanation: { why: reasons }
      });
    }

    // Ordena pelo Score final e extrai o corte do Top X
    const sorted = [...scoredMap.values()].sort((a, b) => b.finalScore - a.finalScore);
    
    return {
      knowledge: sorted.slice(0, 10),
      explanationTree: { 
          strategy: "hybrid_ranked", 
          items: sorted.map(i => ({ id: i.canonicalId, why: i.explanation.why })) 
      }
    };
  }
}
