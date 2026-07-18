export class GraphIndex {
    /**
     * @param {Object} storageProvider - Provedor de Storage (ex: SQLiteProvider)
     */
    constructor(storageProvider) {
        this.storage = storageProvider;
        this.memoryIndex = new Map(); // canonicalId -> nodeId
    }

    /**
     * Carrega o índice do SQLite para Memória (Fast Boot)
     */
    async boot() {
        if (!this.storage) return;
        // Na prática, isso faria uma query no SQLite pegando as associações
        const allRecords = await this.storage.query("SELECT canonicalId, uuid FROM graph_index_table");
        if (allRecords) {
            allRecords.forEach(r => {
                this.memoryIndex.set(r.canonicalId, r.uuid);
            });
        }
    }

    /**
     * Consulta O(1)
     */
    getNodeId(canonicalId) {
        return this.memoryIndex.get(canonicalId) || null;
    }

    /**
     * Atualiza memória e persistência
     */
    async setNodeId(canonicalId, nodeId) {
        this.memoryIndex.set(canonicalId, nodeId);
        
        if (this.storage) {
            // Em lote real, faria UPSERT no SQLite
            await this.storage.execute(
                "INSERT OR REPLACE INTO graph_index_table (canonicalId, uuid) VALUES (?, ?)", 
                [canonicalId, nodeId]
            );
        }
    }

    async remove(canonicalId) {
        this.memoryIndex.delete(canonicalId);
        if (this.storage) {
            await this.storage.execute(
                "DELETE FROM graph_index_table WHERE canonicalId = ?",
                [canonicalId]
            );
        }
    }
}
