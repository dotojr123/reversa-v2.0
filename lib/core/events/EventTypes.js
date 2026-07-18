/**
 * Reversa KOS Structured Events
 */

export const EventTypes = {
    FILE_CHANGED: 'FILE_CHANGED',
    MODULE_UPDATED: 'MODULE_UPDATED',
    RULE_CREATED: 'RULE_CREATED',
    RULE_REMOVED: 'RULE_REMOVED',
    RULE_MERGED: 'RULE_MERGED',
    ENTITY_DISCOVERED: 'ENTITY_DISCOVERED'
};

/**
 * Creates a standard event payload.
 */
export function createEvent(type, payload = {}) {
    return {
        type,
        timestamp: new Date().toISOString(),
        ...payload
    };
}
