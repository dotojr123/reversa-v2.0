/**
 * Reversa KOS Pipeline
 * 
 * Flow:
 * Scanner -> Knowledge Object -> Validation -> Inference -> Knowledge Core -> Repository -> Storage Provider -> Event Store -> Consumers
 */

export class Pipeline {
    constructor(queueProvider, inferenceProvider, knowledgeService) {
        this.queue = queueProvider;
        this.inference = inferenceProvider;
        this.knowledge = knowledgeService;
    }

    async process(knowledgeObject) {
        // 1. Validation
        await this.inference.validate(knowledgeObject);

        // 2. Inference & Enrichment
        const enriched = await this.inference.enrich(knowledgeObject);
        await this.inference.score(enriched);

        // 3. Knowledge Core (Service delegates to Repository -> Storage + Event Store)
        await this.knowledge.processKnowledge(enriched);
    }
}
