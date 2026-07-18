/**
 * Base interface for Inference Engines in Reversa KOS.
 */
export class InferenceProvider {
    /**
     * Infers relationships or missing context from a given payload.
     */
    async infer(knowledgeObject) {
        throw new Error("Method 'infer()' must be implemented.");
    }

    /**
     * Validates consistency of the knowledge object.
     */
    async validate(knowledgeObject) {
        throw new Error("Method 'validate()' must be implemented.");
    }

    /**
     * Enriches the object with inferred data.
     */
    async enrich(knowledgeObject) {
        throw new Error("Method 'enrich()' must be implemented.");
    }

    /**
     * Calculates a confidence score.
     */
    async score(knowledgeObject) {
        throw new Error("Method 'score()' must be implemented.");
    }

    /**
     * Provides an explanation for inferred relations.
     */
    async explain(inferenceId) {
        throw new Error("Method 'explain()' must be implemented.");
    }
}
