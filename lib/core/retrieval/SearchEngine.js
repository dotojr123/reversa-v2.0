export class SearchEngine {
    constructor(sqliteStorage, graphProvider) {
        this.sqlite = sqliteStorage;
        this.graphiti = graphProvider;
    }

    /**
     * Busca léxica exata usando FTS5 do SQLite
     * @param {string} text 
     * @returns {Promise<Array>}
     */
    async textSearch(text) {
        // Usa bm25 no SQLite FTS5 se suportado (requer ORDER BY rank)
        // Sanitiza a query removendo caracteres problemáticos e formatando
        const query = `"${text.replace(/"/g, '""')}"*`;
        const sql = `
            SELECT canonicalId, type, content, bm25(knowledge_fts) as ftsScore
            FROM knowledge_fts
            WHERE knowledge_fts MATCH ?
            ORDER BY ftsScore LIMIT 50
        `;
        
        try {
            const results = await this.sqlite.query(sql, [query]);
            return results.map(row => ({
                canonicalId: row.canonicalId,
                type: row.type,
                content: JSON.parse(row.content),
                fromFts: true,
                ftsScore: Math.abs(row.ftsScore) // bm25 returns negative values natively in sqlite usually, abs for safety
            }));
        } catch (error) {
            console.error('[SearchEngine] FTS Error:', error.message);
            return []; // Failsafe fallback
        }
    }

    /**
     * Busca semântica usando o GraphitiProvider
     * @param {string} text 
     * @param {string} edgeType 'hard', 'soft', or 'all'
     * @returns {Promise<Array>}
     */
    async semanticSearch(text, edgeType = 'all') {
        try {
            // Em uma implementação real, o GraphitiProvider converteria o texto 
            // em um embedding ou chamaria a API de Similaridade.
            // Aqui estamos simulando a chamada delegada.
            const queryModel = { query: text, edgeType, strategy: 'semantic' };
            const graphResult = await this.graphiti.query(queryModel);
            
            // Mock de similaridade semântica pra demonstração local 
            // Mapeia os nós resultantes atribuindo um "semanticDistance"
            return (graphResult?.results || []).map(node => ({
                canonicalId: node.id || node.canonicalId,
                type: node.type,
                content: node.content,
                fromGraphiti: true,
                semanticDistance: Math.random() // Distância aleatória apenas como placeholder
            })).slice(0, 50);

        } catch (error) {
            console.error('[SearchEngine] Graphiti Error:', error.message);
            return [];
        }
    }
}
