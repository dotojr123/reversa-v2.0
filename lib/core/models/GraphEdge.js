import { randomUUID } from 'crypto';

export class GraphEdge {
    constructor(data = {}) {
        this.id = data.id || randomUUID();
        this.source = data.source;
        this.target = data.target;
        this.type = data.type || 'RELATES_TO';
        
        this.weight = data.weight || 1.0;
        this.confidence = data.confidence || 0;
        this.evidenceCount = data.evidenceCount || 0;
        
        this.properties = data.properties || {};
        
        const now = new Date().toISOString();
        this.createdAt = data.createdAt || now;
        this.updatedAt = data.updatedAt || now;
    }
}
