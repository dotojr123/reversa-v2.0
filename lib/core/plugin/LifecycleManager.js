export const PluginState = {
    DISCOVERED: 'DISCOVERED',
    LOADED: 'LOADED',
    INITIALIZED: 'INITIALIZED',
    READY: 'READY',
    DEGRADED: 'DEGRADED',
    FAILED: 'FAILED',
    SHUTDOWN: 'SHUTDOWN',
    DISPOSED: 'DISPOSED'
};

export class LifecycleManager {
    constructor() {
        this.plugins = new Map(); // id -> { instance, state, capabilities, error }
    }

    async register(pluginId, pluginInstance) {
        this.plugins.set(pluginId, { 
            instance: pluginInstance, 
            state: PluginState.DISCOVERED,
            capabilities: null,
            error: null 
        });
        return this.advanceState(pluginId);
    }

    async advanceState(pluginId) {
        const p = this.plugins.get(pluginId);
        if (!p) throw new Error("Plugin not found");

        try {
            // LOADED
            p.state = PluginState.LOADED;
            if (p.instance.load) await p.instance.load();

            // INITIALIZED
            p.state = PluginState.INITIALIZED;
            if (p.instance.initialize) await p.instance.initialize();

            // READY
            p.state = PluginState.READY;
            if (p.instance.getCapabilities) {
                p.capabilities = await p.instance.getCapabilities();
            }

            return p.state;
        } catch (err) {
            p.state = PluginState.FAILED;
            p.error = err.message;
            return p.state;
        }
    }

    async shutdown(pluginId) {
        const p = this.plugins.get(pluginId);
        if (!p) return;

        p.state = PluginState.SHUTDOWN;
        if (p.instance.shutdown) {
            try { await p.instance.shutdown(); } catch(e) {}
        }

        p.state = PluginState.DISPOSED;
        p.instance = null;
    }

    getCapabilities(pluginId) {
        const p = this.plugins.get(pluginId);
        return p && p.state === PluginState.READY ? p.capabilities : null;
    }

    getStatus(pluginId) {
        const p = this.plugins.get(pluginId);
        return p ? { state: p.state, error: p.error } : null;
    }
}
