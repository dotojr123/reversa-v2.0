import { randomUUID } from 'crypto';

export class GraphNode {
    constructor(data = {}) {
        this.id = data.id || randomUUID();
        this.canonicalId = data.canonicalId || null;
        
        this.labels = Array.isArray(data.labels) ? data.labels : [];
        this.properties = data.properties || {};
        this.metadata = data.metadata || {};
        
        this.confidence = data.confidence || 0;
        this.version = data.version || 1;
        this.evidenceCount = data.evidenceCount || 0;
    }
}
