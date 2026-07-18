import test from 'node:test';
import assert from 'node:assert';
import { ImpactService } from '../lib/core/ai/ImpactService.js';
import { ImpactRankingEngine } from '../lib/core/ai/ImpactRankingEngine.js';

test('Impact Analysis Engine: Blast Radius and Risk Calculation', async (t) => {
    // 1. Mock GraphitiProvider
    const mockGraphiti = {
        query: async () => {
            return {
                results: [
                    { id: 'moduleA', type: 'FUNCTION' },
                    { id: 'moduleB', type: 'CLASS' },
                    { id: 'moduleC', type: 'FUNCTION' },
                    { id: 'moduleD', type: 'CLASS' }
                ],
                edges: [
                    // Hard edges (Deterministic Blast Radius)
                    { source: 'moduleA', target: 'moduleB', type: 'CALLS' },
                    { source: 'moduleB', target: 'moduleC', type: 'DEPENDS_ON' },
                    
                    // Soft edges (Probabilistic Risk)
                    { source: 'moduleC', target: 'moduleD', type: 'SIMILAR_TO', weight: 0.85 }
                ]
            };
        }
    };

    const impactService = new ImpactService(mockGraphiti);
    const rankingEngine = new ImpactRankingEngine();

    await t.test('Should calculate correct deterministic blast radius and soft risks', async () => {
        const rawImpact = await impactService.calculateImpact('moduleA', { maxDepth: 3, confidenceThreshold: 0.7 });
        
        assert.strictEqual(rawImpact.targetId, 'moduleA');
        assert.strictEqual(rawImpact.deterministicBlastRadius.length, 2, 'Should find moduleB and moduleC as hard impacts');
        assert.strictEqual(rawImpact.probabilisticRisks.length, 1, 'Should find moduleD as soft risk');
        
        const moduleC = rawImpact.deterministicBlastRadius.find(r => r.canonicalId === 'moduleC');
        assert.strictEqual(moduleC.distance, 2);

        const moduleD = rawImpact.probabilisticRisks.find(r => r.canonicalId === 'moduleD');
        assert.strictEqual(moduleD.distance, 3);
        assert.strictEqual(moduleD.confidence, 0.85);
    });

    await t.test('Ranking engine should consolidate scores', async () => {
        const rawImpact = await impactService.calculateImpact('moduleA', { maxDepth: 3, confidenceThreshold: 0.7 });
        const rankedImpact = rankingEngine.rank(rawImpact);

        // Score: (2 hard * 2.0) + (1 soft * 0.85 * 1.0) = 4.0 + 0.85 = 4.85
        assert.strictEqual(rankedImpact.impactScore, 4.85);
        assert.ok(rankedImpact.explanationTree.summary.includes('Quebra estrutural em 2'));
    });
});
