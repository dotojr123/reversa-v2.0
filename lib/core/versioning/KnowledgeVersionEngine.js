import crypto from 'crypto';

export class KnowledgeVersionEngine {
    constructor(sqliteStorage) {
        this.storage = sqliteStorage;
        this.headCommit = null;
    }

    async init() {
        if (!this.storage) return;
        
        const rows = await this.storage.query('SELECT id FROM knowledge_commits ORDER BY rowid DESC LIMIT 1');
        if (rows && rows.length > 0) {
            this.headCommit = rows[0].id;
        } else {
            this.headCommit = null; 
        }
    }

    /**
     * Recebe o ChangeSet (diff das modificações processadas).
     * Transforma em um KOS-015 Commit Atômico.
     */
    async commit(graphChangeSet, author = 'system', reason = 'Update') {
        const commitId = crypto.randomUUID();
        
        // Em um VCS real, hashearíamos os objetos
        const hash = crypto.createHash('sha256').update(Date.now().toString()).digest('hex');

        const changeset = {
            added: graphChangeSet.addedNodes.map(n => n.canonicalId || n.id),
            updated: graphChangeSet.updatedNodes.map(n => n.canonicalId || n.id),
            removed: graphChangeSet.removedNodes.map(n => n.canonicalId || n.id)
        };

        const graphChanges = {
            addedNodes: graphChangeSet.addedNodes.length,
            addedEdges: graphChangeSet.addedEdges.length,
            removedNodes: graphChangeSet.removedNodes.length,
            removedEdges: graphChangeSet.removedEdges.length
        };

        const newCommit = {
            id: commitId,
            parent: this.headCommit,
            timestamp: Date.now(),
            author,
            reason,
            changeset,
            graphChanges,
            knowledgeHash: hash,
            schemaVersion: "KOS-015"
        };

        // Salvar no SQLite 
        await this.storage.execute(
            'INSERT INTO knowledge_commits (id, parent, timestamp, author, reason, changeset, graphChanges, knowledgeHash, schemaVersion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [
                newCommit.id,
                newCommit.parent,
                newCommit.timestamp,
                newCommit.author,
                newCommit.reason,
                JSON.stringify(newCommit.changeset),
                JSON.stringify(newCommit.graphChanges),
                newCommit.knowledgeHash,
                newCommit.schemaVersion
            ]
        );

        this.headCommit = commitId;
        return newCommit;
    }

    /**
     * Retorna a evolução de uma entidade baseada nos commits (KOS-016)
     */
    async history(canonicalId) {
        const rows = await this.storage.query('SELECT * FROM knowledge_commits ORDER BY rowid ASC');
        
        const versions = [];
        
        for (const row of rows) {
            const changeset = JSON.parse(row.changeset);
            if (changeset.added.includes(canonicalId)) {
                versions.push({ commitId: row.id, timestamp: row.timestamp, author: row.author, action: 'added' });
            } else if (changeset.updated.includes(canonicalId)) {
                versions.push({ commitId: row.id, timestamp: row.timestamp, author: row.author, action: 'updated' });
            } else if (changeset.removed.includes(canonicalId)) {
                versions.push({ commitId: row.id, timestamp: row.timestamp, author: row.author, action: 'removed' });
            }
        }
        
        return {
            canonicalId,
            versions,
            schemaVersion: "KOS-016"
        };
    }

    /**
     * Traz a base de conhecimento de volta ao estado do Commit especificado
     */
    async rollback(commitId) {
        throw new Error("Rollback requires full SQLite temporal persistence to be implemented.");
    }
    
    /**
     * SPRINT 6b: Iterates from the first commit up to the target commitId, 
     * applying changesets to reconstruct the active canonicalIds.
     */
    async replay(commitId) {
        const rows = await this.storage.query('SELECT * FROM knowledge_commits ORDER BY rowid ASC');
        
        const activeIds = new Set();
        let commitFound = false;

        for (const row of rows) {
            const changeset = JSON.parse(row.changeset);
            
            for (const id of changeset.added) activeIds.add(id);
            // Updates don't change presence, but in a real system they'd update the content
            for (const id of changeset.removed) activeIds.delete(id);
            
            if (row.id === commitId) {
                commitFound = true;
                break;
            }
        }
        
        if (!commitFound) throw new Error(`Commit ${commitId} not found during replay.`);
        return Array.from(activeIds);
    }
}
