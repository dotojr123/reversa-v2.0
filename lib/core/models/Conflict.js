import { randomUUID } from 'crypto';

export const ConflictSeverity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    BLOCKER: 'BLOCKER'
};

export const ConflictType = {
    STRUCTURAL: 'STRUCTURAL',
    SEMANTIC: 'SEMANTIC',
    LOGICAL: 'LOGICAL'
};

export const ConflictStatus = {
    OPEN: 'OPEN',
    RESOLVED: 'RESOLVED',
    IGNORED: 'IGNORED'
};

export class Conflict {
    constructor(data = {}) {
        this.id = data.id || randomUUID();
        this.severity = data.severity || ConflictSeverity.MEDIUM;
        this.type = data.type || ConflictType.LOGICAL;
        
        this.ruleA = data.ruleA || ''; // UUID or Canonical ID
        this.ruleB = data.ruleB || ''; // UUID or Canonical ID
        
        this.reason = data.reason || 'Conflito detectado';
        
        this.resolver = data.resolver || null;
        this.status = data.status || ConflictStatus.OPEN;
        
        this.createdAt = data.createdAt || new Date().toISOString();
        this.resolvedAt = data.resolvedAt || null;
    }
    
    resolve(resolverId) {
        this.status = ConflictStatus.RESOLVED;
        this.resolver = resolverId;
        this.resolvedAt = new Date().toISOString();
    }
}
