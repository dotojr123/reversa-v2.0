import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { KnowledgeVersionEngine } from '../lib/core/versioning/KnowledgeVersionEngine.js';
import { SQLiteStorage } from '../lib/core/storage/SQLiteStorage.js';

describe('VersionEngine — Sprint 6a', () => {
    let storage;
    let engine;
    let commitIds = [];

    before(async () => {
        // Use in-memory SQLite for tests
        storage = new SQLiteStorage(':memory:');
        await storage.init();
        engine = new KnowledgeVersionEngine(storage);
        await engine.init();
    });

    test('cria 3 commits sequenciais e persiste no banco', async () => {
        const c1 = await engine.commit({
            addedNodes: [{ id: 'Class.A' }],
            updatedNodes: [],
            removedNodes: [],
            addedEdges: [],
            removedEdges: []
        }, 'system', 'Add A');
        
        const c2 = await engine.commit({
            addedNodes: [{ id: 'Class.B' }],
            updatedNodes: [{ id: 'Class.A' }],
            removedNodes: [],
            addedEdges: [],
            removedEdges: []
        }, 'system', 'Add B, update A');
        
        const c3 = await engine.commit({
            addedNodes: [],
            updatedNodes: [],
            removedNodes: [{ id: 'Class.A' }],
            addedEdges: [],
            removedEdges: []
        }, 'system', 'Remove A');

        commitIds = [c1.id, c2.id, c3.id];
        
        assert.equal(engine.headCommit, c3.id);
        assert.equal(c2.parent, c1.id);
        assert.equal(c3.parent, c2.id);
    });

    test('reconstruir o headCommit ao reinicializar (simulando matar o processo)', async () => {
        // Nova instância com o MESMO storage
        const newEngine = new KnowledgeVersionEngine(storage);
        await newEngine.init();

        assert.equal(newEngine.headCommit, commitIds[2], 'init() deveria recuperar o último commit persistido');
    });

    test('history(canonicalId) recupera a trilha correta de um objeto', async () => {
        const history = await engine.history('Class.A');
        
        assert.equal(history.canonicalId, 'Class.A');
        assert.equal(history.versions.length, 3);
        assert.equal(history.versions[0].action, 'added');
        assert.equal(history.versions[1].action, 'updated');
        assert.equal(history.versions[2].action, 'removed');
    });

    test('replay(commitId) reconstrói os canonicalIds ativos no momento do commit', async () => {
        const stateC1 = await engine.replay(commitIds[0]);
        assert.deepEqual(stateC1.sort(), ['Class.A']);

        const stateC2 = await engine.replay(commitIds[1]);
        assert.deepEqual(stateC2.sort(), ['Class.A', 'Class.B']);

        const stateC3 = await engine.replay(commitIds[2]);
        assert.deepEqual(stateC3.sort(), ['Class.B']); // Class.A foi removida
    });
});
