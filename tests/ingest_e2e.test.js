import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import { SQLiteStorage } from '../lib/core/storage/SQLiteStorage.js';
import ingestCommand from '../lib/commands/ingest.js';

describe('Pipeline Ingest (E2E) — Sprint 6b', () => {
    let dbPath = '.reversa/test_knowledge.db';

    test('ingestCommand runs on fixture without errors and persists commit', async () => {
        // FIXME: mesma fixture ausente do scanner.test.js — ver comentário lá.
        const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'sprint6a');
        
        // Mock stdout to avoid noise during test
        const originalLog = console.log;
        console.log = () => {};

        try {
            await ingestCommand(['--path', fixturePath, '--mock-graph', '--db-path', dbPath]);
            
            // Verify that the sqlite db has a commit with nodes
            const storage = new SQLiteStorage(dbPath);
            await storage.init();
            const rows = await storage.query('SELECT * FROM knowledge_commits');
            
            assert.equal(rows.length, 1, 'Deve haver exatamente 1 commit de ingestão');
            
            const changeset = JSON.parse(rows[0].changeset);
            // Fixture contains multiple nodes, verify that added has them
            assert.ok(changeset.added.length > 5, 'Deve ter ingerido múltiplos nós do fixture');
            
            await storage.close();
        } finally {
            console.log = originalLog;
        }
    });
});
