/**
 * @class QueryPlanner
 * @description Decodifica a intenção da busca e monta o plano de execução híbrido (DAG).
 */
export class QueryPlanner {
  constructor(searchEngine) {
    this.searchEngine = searchEngine;
  }

  /**
   * @param {Object} kosQueryModel - Conforme especificação KOS-008
   * @returns {Promise<Object>} Conforme especificação KOS-012 (Execution Plan)
   */
  async planAndExecute(kosQueryModel) {
    const { query, strategy = 'hybrid', limit = 10, edgeType = 'all' } = kosQueryModel;
    
    // Default: Se for híbrido, dispara as duas buscas em paralelo (DAG Físico)
    if (strategy === 'hybrid') {
      const [keywordResults, semanticResults] = await Promise.all([
        this.searchEngine.textSearch(query),
        this.searchEngine.semanticSearch(query, edgeType)
      ]);

      // Une os resultados, marcando as flags fromFts e fromGraphiti para sobreposições
      const rawResults = this._mergeResults(keywordResults, semanticResults);

      return {
        planner: 'hybrid',
        steps: ['keyword_fts', 'graphiti_semantic', 'intersect_merge'],
        rawResults: rawResults
      };
    }
    
    if (strategy === 'keyword') {
      const results = await this.searchEngine.textSearch(query);
      return { planner: 'keyword', steps: ['keyword_fts'], rawResults: results };
    }

    if (strategy === 'semantic' || strategy === 'graph') {
      const results = await this.searchEngine.semanticSearch(query, edgeType);
      return { planner: 'semantic', steps: ['graphiti_semantic'], rawResults: results };
    }
    
    return { planner: 'unknown', steps: [], rawResults: [] };
  }

  _mergeResults(keywordResults, semanticResults) {
    const map = new Map();

    for (const item of keywordResults) {
        map.set(item.canonicalId, { ...item });
    }

    for (const item of semanticResults) {
        if (map.has(item.canonicalId)) {
            const existing = map.get(item.canonicalId);
            existing.fromGraphiti = true;
            existing.semanticDistance = item.semanticDistance;
        } else {
            map.set(item.canonicalId, { ...item });
        }
    }

    return Array.from(map.values());
  }
}
