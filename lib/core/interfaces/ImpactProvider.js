/**
 * @interface ImpactProvider
 * @description Contrato canônico para cálculo de propagação de mudanças e análise de risco arquitetural.
 */
export class ImpactProvider {
    /**
     * @param {string} canonicalId - O ID do nó que sofrerá a alteração (módulo, classe, api).
     * @param {Object} options - Filtros de profundidade e limiares de confiança.
     * @returns {Promise<Object>} Relatório estruturado conforme KOS-018.
     */
    async calculateImpact(canonicalId, options = { maxDepth: 3, confidenceThreshold: 0.7 }) { 
      throw new Error('Not Implemented'); 
    }
}
