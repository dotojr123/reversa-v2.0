/**
 * Base interface for Job Queues in Reversa KOS.
 */
export class QueueProvider {
    /**
     * Enqueues a message/job.
     * @param {Object} payload 
     */
    async enqueue(payload) {
        throw new Error("Method 'enqueue()' must be implemented.");
    }

    /**
     * Dequeues the next available job.
     */
    async dequeue() {
        throw new Error("Method 'dequeue()' must be implemented.");
    }

    /**
     * Acknowledges the successful processing of a job.
     * @param {string} jobId 
     */
    async ack(jobId) {
        throw new Error("Method 'ack()' must be implemented.");
    }

    /**
     * Re-queues a failed job.
     * @param {string} jobId 
     */
    async retry(jobId) {
        throw new Error("Method 'retry()' must be implemented.");
    }

    /**
     * Returns the current size of the queue.
     */
    async size() {
        throw new Error("Method 'size()' must be implemented.");
    }
}
