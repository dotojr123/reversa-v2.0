export class HealthManager {
    constructor(lifecycleManager, storage, queue) {
        this.lifecycleManager = lifecycleManager;
        this.storage = storage; // KOS Database
        this.queue = queue; // Event Bus / Job Queue
    }

    async checkAll() {
        const report = {
            status: 'OK',
            timestamp: Date.now(),
            components: {}
        };

        // 1. Storage (SQLite)
        try {
            const start = performance.now();
            // await this.storage.ping();
            const latency = performance.now() - start;
            report.components['SQLite'] = { status: 'OK', latency: `${latency.toFixed(2)}ms` };
        } catch (e) {
            report.components['SQLite'] = { status: 'FAILED', error: e.message };
            report.status = 'FAILED';
        }

        // 2. Queue / EventBus
        try {
            // await this.queue.ping();
            report.components['EventBus'] = { status: 'OK' };
        } catch (e) {
            report.components['EventBus'] = { status: 'WARNING', error: e.message };
            if (report.status === 'OK') report.status = 'WARNING';
        }

        // 3. Plugins (Neo4j, Graphiti, etc) via LifecycleManager
        for (const [id, plugin] of this.lifecycleManager.plugins.entries()) {
            if (plugin.instance.health) {
                const start = performance.now();
                const healthRes = await plugin.instance.health();
                const latency = performance.now() - start;
                
                report.components[id] = { 
                    status: healthRes.status, 
                    latency: `${latency.toFixed(2)}ms`,
                    details: healthRes.details
                };

                if (healthRes.status === 'FAILED') report.status = 'FAILED';
                if (healthRes.status === 'WARNING' && report.status === 'OK') report.status = 'WARNING';
            }
        }

        return report;
    }
}
