/**
 * Base interface for Event Store in Reversa KOS.
 */
export class EventStoreProvider {
    /**
     * Appends a new event to the store.
     * @param {Object} event - Structured event object.
     */
    async append(event) {
        throw new Error("Method 'append()' must be implemented.");
    }

    /**
     * Retrieves all events for a specific stream or entity.
     * @param {string} streamId 
     */
    async getEvents(streamId) {
        throw new Error("Method 'getEvents()' must be implemented.");
    }

    /**
     * Retrieves events based on a time range.
     */
    async getEventsByTime(startTime, endTime) {
        throw new Error("Method 'getEventsByTime()' must be implemented.");
    }
}
