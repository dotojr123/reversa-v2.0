import { QueueProvider } from '../../../core/interfaces/QueueProvider.js';

export class MemoryQueue extends QueueProvider {
    constructor() {
        super();
        this.queue = [];
    }

    async enqueue(payload) {
        this.queue.push(payload);
    }

    async dequeue() {
        return this.queue.shift() || null;
    }

    async ack(jobId) {
        // In a memory queue without locks, dequeue removes it.
        // ack is mostly a no-op here unless we implement visibility timeouts.
        return true;
    }

    async retry(jobId) {
        // no-op for basic memory queue
    }

    async size() {
        return this.queue.length;
    }
}
