export class RankingEngine {
    constructor(rankers) {
        // rankers: [ConfidenceRanker, EvidenceRanker, GraphRanker, TemporalRanker, BusinessRanker]
        this.rankers = rankers || [];
    }

    async rank(knowledgeArray, contextState) {
        const scoredKnowledge = knowledgeArray.map(k => ({
            item: k,
            score: 0,
            breakdown: {}
        }));

        for (const ranker of this.rankers) {
            for (const sk of scoredKnowledge) {
                const points = await ranker.evaluate(sk.item, contextState);
                sk.score += points;
                sk.breakdown[ranker.name] = points;
            }
        }

        // Sort desc
        scoredKnowledge.sort((a, b) => b.score - a.score);

        // Retorna mutado
        return scoredKnowledge.map(sk => {
            sk.item._rankingMetadata = { score: sk.score, breakdown: sk.breakdown };
            return sk.item;
        });
    }
}

export class ConfidenceRanker {
    name = 'ConfidenceRanker';
    async evaluate(knowledgeItem) {
        return (knowledgeItem.confidence || 0) * 10;
    }
}

export class EvidenceRanker {
    name = 'EvidenceRanker';
    async evaluate(knowledgeItem) {
        return (knowledgeItem.evidenceCount || 0) * 5;
    }
}
