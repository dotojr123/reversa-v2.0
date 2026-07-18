export class KnowledgeRepository {
    constructor(registry) {
        this.registry = registry;
    }

    get storage() {
        return this.registry.get('StorageProvider');
    }

    async save(knowledgeObject) {
        await this.storage.saveObject(knowledgeObject);
    }

    async getById(id) {
        return await this.storage.getObject(id);
    }

    async delete(id) {
        await this.storage.deleteObject(id);
    }
}
