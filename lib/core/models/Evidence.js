import { randomUUID } from 'crypto';

export const EvidenceType = {
    SOURCE_CODE: 'SOURCE_CODE',
    DOCUMENT: 'DOCUMENT',
    LOG: 'LOG',
    API: 'API',
    TEST: 'TEST',
    USER: 'USER',
    LLM: 'LLM'
};

export class Evidence {
    constructor(data = {}) {
        this.id = data.id || randomUUID();
        this.agent = data.agent || 'SYSTEM';
        this.provider = data.provider || 'UNKNOWN';
        this.type = data.type || EvidenceType.SOURCE_CODE;
        
        this.source = data.source || '';
        this.path = data.path || '';
        this.line = data.line || null;
        this.column = data.column || null;
        
        this.raw = data.raw || '';
        this.metadata = data.metadata || {};
        
        this.confidence = data.confidence || 0;
        this.timestamp = data.timestamp || new Date().toISOString();
    }
}
