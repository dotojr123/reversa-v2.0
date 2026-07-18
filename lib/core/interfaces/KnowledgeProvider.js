/**
 * Base interface for querying knowledge.
 * Separated from StorageProvider to support read-heavy specializations like Graph.
 */
export class KnowledgeProvider {
    /**
     * Connects to the underlying source.
     */
    async connect(config) {
        throw new Error("Method 'connect()' must be implemented.");
    }

    /**
     * Searches for objects based on a query.
     * @param {Object} query - The query object.
     */
    async search(query) {
        throw new Error("Method 'search()' must be implemented.");
    }

    /**
     * Finds dependencies or relationships for a given object ID.
     * @param {string} id - The global ID.
     */
    async findRelationships(id) {
        throw new Error("Method 'findRelationships()' must be implemented.");
    }
}
