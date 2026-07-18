import { EventEmitter } from 'events';

class ReversaEventBus extends EventEmitter {}

export const eventBus = new ReversaEventBus();

// Core Events
export const EVENTS = {
    FILE_CHANGED: 'FILE_CHANGED',
    MODULE_UPDATED: 'MODULE_UPDATED',
    RULE_CHANGED: 'RULE_CHANGED',
    DOC_UPDATED: 'DOC_UPDATED'
};
