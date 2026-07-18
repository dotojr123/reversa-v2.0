import { createEvent, EventTypes } from '../events/EventTypes.js';

export class KnowledgeService {
    constructor(repository, registry) {
        this.repository = repository;
        this.registry = registry;
    }

    get eventStore() {
        return this.registry.get('EventStoreProvider');
    }

    /**
     * Processes a validated and enriched Knowledge Object.
     */
    async processKnowledge(knowledgeObject) {
        // Validation could also happen here or via a dedicated Inference/Validation plugin
        if (!knowledgeObject.id) throw new Error("Knowledge Object must have an ID.");
        
        // 1. Save to repository
        await this.repository.save(knowledgeObject);

        // 2. Publish event to Event Store
        const event = createEvent(EventTypes.MODULE_UPDATED, {
            id: knowledgeObject.id,
            type: knowledgeObject.type,
            metadata: { confidence: knowledgeObject.confidence }
        });

        if (this.eventStore) {
            await this.eventStore.append(event);
        }
    }
}
