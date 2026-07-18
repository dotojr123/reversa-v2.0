import { ValidationProcessor } from './processors/ValidationProcessor.js';
import { DedupProcessor } from './processors/DedupProcessor.js';
import { EvidenceProcessor } from './processors/EvidenceProcessor.js';
import { ConflictProcessor } from './processors/ConflictProcessor.js';
import { ConfidenceProcessor } from './processors/ConfidenceProcessor.js';

export class KnowledgeEngine {
    constructor(repository) {
        this.repository = repository;
        this.dedup = new DedupProcessor(repository);
    }

    /**
     * Ponto de entrada do processamento inteligente de um objeto bruto extraído pelo Scanner.
     */
    async process(incomingKo) {
        // 1. Validation
        ValidationProcessor.validate(incomingKo);

        // 2. Dedup
        const { target, isMerge } = await this.dedup.process(incomingKo);

        // 3. Evidence
        EvidenceProcessor.process(target, incomingKo);

        // 4. Conflict
        if (isMerge) {
            ConflictProcessor.process(target, incomingKo);
        }

        // 5. Confidence
        ConfidenceProcessor.process(target);

        // Finaliza
        return target;
    }
}
