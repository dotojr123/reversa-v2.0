export class GraphCache {
    constructor() {
        this.pathCache = new Map();
        this.neighborCache = new Map();
        this.queryCache = new Map();
        this.subgraphCache = new Map();
        
        // Simples TTL config se necessário
        this.ttl = 60000; 
    }

    // Path
    setPath(idA, idB, path) {
        this.pathCache.set(`${idA}-${idB}`, { data: path, ts: Date.now() });
    }

    getPath(idA, idB) {
        const item = this.pathCache.get(`${idA}-${idB}`);
        if (item && (Date.now() - item.ts < this.ttl)) return item.data;
        return null;
    }

    // Subgraph
    setSubgraph(queryHash, subgraph) {
        this.subgraphCache.set(queryHash, { data: subgraph, ts: Date.now() });
    }

    getSubgraph(queryHash) {
        const item = this.subgraphCache.get(queryHash);
        if (item && (Date.now() - item.ts < this.ttl)) return item.data;
        return null;
    }

    invalidateAll() {
        this.pathCache.clear();
        this.neighborCache.clear();
        this.queryCache.clear();
        this.subgraphCache.clear();
    }
}
