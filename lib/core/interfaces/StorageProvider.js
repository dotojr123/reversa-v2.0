/**
 * Base interface for all Storage Providers in Reversa KOS.
 * This handles raw persistence of canonical Knowledge Objects.
 */
export class StorageProvider {
    /**
     * Connects to the underlying storage.
     */
    async connect(config) {
        throw new Error("Method 'connect()' must be implemented.");
    }

    /**
     * Disconnects from the underlying storage.
     */
    async disconnect() {
        throw new Error("Method 'disconnect()' must be implemented.");
    }

    /**
     * Saves a Knowledge Object.
     * @param {Object} knowledgeObject - The canonical Knowledge Object.
     */
    async saveObject(knowledgeObject) {
        throw new Error("Method 'saveObject()' must be implemented.");
    }

    /**
     * Retrieves a Knowledge Object by its ID.
     * @param {string} id - The global ID of the object.
     */
    async getObject(id) {
        throw new Error("Method 'getObject()' must be implemented.");
    }

    /**
     * Deletes a Knowledge Object by its ID.
     * @param {string} id - The global ID of the object.
     */
    async deleteObject(id) {
        throw new Error("Method 'deleteObject()' must be implemented.");
    }
}
