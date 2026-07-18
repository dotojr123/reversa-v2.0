import { GraphProvider } from '../../../core/interfaces/GraphProvider.js';

export class MemoryGraphProvider extends GraphProvider {
    constructor() {
        super();
        this.nodes = new Map();
        this.edges = new Map();
        this.inTransaction = false;
        this.txBuffer = { nodes: new Map(), edges: new Map(), removedNodes: new Set() };
    }

    async beginTransaction() {
        if (this.inTransaction) throw new Error("Transaction already in progress");
        this.inTransaction = true;
        this.txBuffer = { nodes: new Map(), edges: new Map(), removedNodes: new Set() };
    }

    async commit() {
        if (!this.inTransaction) throw new Error("No transaction in progress");
        
        // Remove nodes
        for (const nodeId of this.txBuffer.removedNodes) {
            this.nodes.delete(nodeId);
            // Cascading remove edges conceptually
        }

        // Upsert nodes
        for (const [id, node] of this.txBuffer.nodes.entries()) {
            this.nodes.set(id, node);
        }

        // Upsert edges
        for (const [id, edge] of this.txBuffer.edges.entries()) {
            this.edges.set(id, edge);
        }

        this.inTransaction = false;
        this.txBuffer = { nodes: new Map(), edges: new Map(), removedNodes: new Set() };
    }

    async rollback() {
        if (!this.inTransaction) throw new Error("No transaction in progress");
        this.inTransaction = false;
        this.txBuffer = { nodes: new Map(), edges: new Map(), removedNodes: new Set() };
    }

    async bulkSave(nodes, edges) {
        if (!this.inTransaction) throw new Error("Must be in transaction for bulk operations");
        nodes.forEach(n => this.txBuffer.nodes.set(n.id, n));
        edges.forEach(e => this.txBuffer.edges.set(e.id, e));
    }

    async bulkUpdate(nodes, edges) {
        if (!this.inTransaction) throw new Error("Must be in transaction for bulk operations");
        nodes.forEach(n => this.txBuffer.nodes.set(n.id, n));
        edges.forEach(e => this.txBuffer.edges.set(e.id, e));
    }

    async bulkRemove(nodes) {
        if (!this.inTransaction) throw new Error("Must be in transaction for bulk operations");
        nodes.forEach(n => this.txBuffer.removedNodes.add(n.id));
    }

    async health() {
        return { status: 'OK', provider: 'MemoryGraphProvider' };
    }

    async statistics() {
        return {
            nodes: this.nodes.size,
            edges: this.edges.size
        };
    }
}
