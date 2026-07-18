import fs from 'fs';
import path from 'path';

/**
 * Registry for all plugins and providers in Reversa KOS using manifest-based discovery.
 */
export class CapabilityRegistry {
    constructor() {
        this.providers = new Map();
        this.manifests = new Map();
    }

    /**
     * Scans a directory for plugin.json manifests and registers them.
     * Na fundação, as instâncias ainda são providas manualmente no start, mas mapeadas por capabilities.
     * Numa evolução futura, ele importará as classes diretamente do manifest (entrypoint).
     */
    async scan(pluginsDir) {
        if (!fs.existsSync(pluginsDir)) return;

        const dirents = fs.readdirSync(pluginsDir, { withFileTypes: true });
        
        for (const dirent of dirents) {
            const fullPath = path.join(pluginsDir, dirent.name);
            if (dirent.isDirectory()) {
                const manifestPath = path.join(fullPath, 'plugin.json');
                if (fs.existsSync(manifestPath)) {
                    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                    this.manifests.set(manifest.name, manifest);
                }
                
                // Recursivo
                await this.scan(fullPath);
            }
        }
    }

    register(capability, providerInstance) {
        this.providers.set(capability, providerInstance);
    }

    get(capability) {
        const provider = this.providers.get(capability);
        if (!provider) throw new Error(`Capability '${capability}' not found in Registry.`);
        return provider;
    }
}
