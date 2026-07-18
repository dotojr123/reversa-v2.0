import { randomUUID } from 'crypto';

export class KnowledgeObject {
    constructor(data = {}) {
        this.uuid = data.uuid || randomUUID();
        this.businessId = data.businessId || '';
        this.canonicalId = data.canonicalId || '';
        this.type = data.type || 'UNKNOWN';
        this.schemaVersion = '1.0';
        this.knowledgeVersion = data.knowledgeVersion || 1;
        this.content = data.content || {};
        this.confidenceScore = data.confidenceScore || 0;
        this.evidences = data.evidences || [];
        this.conflicts = data.conflicts || [];
        
        const now = new Date().toISOString();
        this.createdAt = data.createdAt || now;
        this.updatedAt = data.updatedAt || now;
        this.createdBy = data.createdBy || 'SYSTEM';
        this.updatedBy = data.updatedBy || this.createdBy;
    }

    addEvidence(evidence) {
        this.evidences.push(evidence);
        this.updatedAt = new Date().toISOString();
        this.knowledgeVersion += 1;
    }

    addConflict(conflictId) {
        if (!this.conflicts.includes(conflictId)) {
            this.conflicts.push(conflictId);
            this.updatedAt = new Date().toISOString();
            this.knowledgeVersion += 1;
        }
    }
}
