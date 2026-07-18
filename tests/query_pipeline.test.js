import test from 'node:test';
import assert from 'node:assert';

import { SearchEngine } from '../lib/core/retrieval/SearchEngine.js';
import { QueryPlanner } from '../lib/core/retrieval/QueryPlanner.js';
import { RankingEngine } from '../lib/core/retrieval/RankingEngine.js';
import { ContextAssembly } from '../lib/core/retrieval/ContextAssembly.js';

test('Query Pipeline: Hybrid Search Execution and Context Assembly', async (t) => {
    // 1. Mock Storage and Provider
    const mockSqlite = {
        query: async (sql, params) => {
            return [
                { canonicalId: 'mod1::auth', type: 'FUNCTION', content: '{"code":"function auth(){}"}', ftsScore: -2.5 }
            ];
        }
    };

    const mockGraphiti = {
        query: async (model) => {
            return {
                results: [
                    { id: 'mod1::auth', type: 'FUNCTION', content: { code: 'function auth(){}' } },
                    { id: 'mod2::login', type: 'FUNCTION', content: { code: 'function login(){}' } }
                ]
            };
        }
    };

    const searchEngine = new SearchEngine(mockSqlite, mockGraphiti);
    const queryPlanner = new QueryPlanner(searchEngine);
    const rankingEngine = new RankingEngine();
    const contextAssembly = new ContextAssembly();

    await t.test('Query Planner should merge FTS and Semantic results', async () => {
        const kosQueryModel = { query: 'auth', strategy: 'hybrid', edgeType: 'all' };
        const executionPlan = await queryPlanner.planAndExecute(kosQueryModel);
        
        assert.strictEqual(executionPlan.planner, 'hybrid');
        assert.strictEqual(executionPlan.rawResults.length, 2, 'Should deduplicate identical nodes');
        
        const authNode = executionPlan.rawResults.find(r => r.canonicalId === 'mod1::auth');
        assert.ok(authNode.fromFts, 'Should be flagged as from FTS');
        assert.ok(authNode.fromGraphiti, 'Should be flagged as from Graphiti');
    });

    await t.test('Ranking Engine should score intersection higher', async () => {
        const rawResults = [
            { canonicalId: 'mod1::auth', fromFts: true, ftsScore: 2.5, fromGraphiti: true, semanticDistance: 0.9, updatedAt: new Date().toISOString() },
            { canonicalId: 'mod2::login', fromGraphiti: true, semanticDistance: 0.7, updatedAt: new Date().toISOString() }
        ];

        const rankedData = await rankingEngine.rank(rawResults);
        assert.strictEqual(rankedData.knowledge.length, 2);
        assert.strictEqual(rankedData.knowledge[0].canonicalId, 'mod1::auth', 'Auth should rank higher due to intersection');
        assert.ok(rankedData.knowledge[0].finalScore > rankedData.knowledge[1].finalScore);
    });

    await t.test('Context Assembly should output compact markdown', async () => {
        const rankedData = {
            knowledge: [
                { canonicalId: 'mod1::auth', type: 'FUNCTION', finalScore: 1.54, content: { code: 'function auth(){}' } }
            ],
            explanationTree: {
                items: [
                    { id: 'mod1::auth', why: ['Léxica', 'Semântica'] }
                ]
            }
        };

        const markdown = contextAssembly.assemble(rankedData);
        assert.ok(markdown.includes('### Contexto Injetado do Reversa KOS'));
        assert.ok(markdown.includes('#### [FUNCTION] auth'));
        assert.ok(markdown.includes('```javascript'));
        assert.ok(markdown.includes('Léxica | Semântica'));
    });
});
