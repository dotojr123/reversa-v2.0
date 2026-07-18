import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StudioServer {
    constructor(gateway, graphProvider) {
        this.gateway = gateway;
        this.graphProvider = graphProvider;
        this.app = new Hono();
        this.setupRoutes();
    }

    setupRoutes() {
        // Servir arquivos estáticos da pasta UI
        this.app.use('/*', serveStatic({ root: './lib/plugins/studio/ui' }));

        // Rota principal do Gateway (Unificada)
        this.app.post('/api/runtime', async (c) => {
            try {
                const body = await c.req.json();
                
                // O body deve conter { capability: '...', payload: {...} }
                if (!body.capability) {
                    return c.json({ error: 'Atributo "capability" é obrigatório.' }, 400);
                }

                // Dispara pro RequestRouter via Gateway
                const response = await this.gateway.handleRequest(body);
                
                return c.json(response);
            } catch (error) {
                console.error('[StudioServer] Erro no Runtime:', error);
                return c.json({ error: error.message }, 500);
            }
        });

        // Rota específica do Grafo (já que o GraphProvider não passa pelo Router padrão neste mock)
        this.app.get('/api/graph', async (c) => {
            try {
                const graphData = await this.graphProvider.query({ query: '' });
                return c.json(graphData);
            } catch (error) {
                return c.json({ error: error.message }, 500);
            }
        });
    }

    async start(port = 3000) {
        return new Promise((resolve) => {
            serve({
                fetch: this.app.fetch,
                port
            }, (info) => {
                console.log(`🧠 Reversa Knowledge Studio rodando em http://localhost:${info.port}`);
                resolve(info);
            });
        });
    }
}
