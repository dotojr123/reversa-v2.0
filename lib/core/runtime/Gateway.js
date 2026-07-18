export class Gateway {
    /**
     * O Gateway é o ponto de entrada agnóstico.
     * REST, MCP, CLI e GraphQL instanciam ou se conectam ao Gateway.
     * O Gateway NÃO orquestra nada, ele apenas envelopa o protocolo
     * num pacote padronizado e repassa ao RequestRouter.
     */
    constructor(requestRouter) {
        this.router = requestRouter;
    }

    /**
     * Recebe um payload de qualquer interface (ex: MCP tool arguments ou req.body do Express)
     * @param {Object} payloadKOS008 - O objeto que respeita KOS-008
     * @returns {Promise<Object>} - O objeto que respeita KOS-009
     */
    async handleRequest(payloadKOS008) {
        // Envelopar métricas de tracing no início
        const traceId = crypto.randomUUID();
        const start = Date.now();

        try {
            // Repassa cegamente pro Router
            const response = await this.router.route(payloadKOS008, { traceId });

            // Anexa as métricas do Gateway no final
            if (response && response.metrics) {
                response.metrics.spans = response.metrics.spans || {};
                response.metrics.spans.gateway = {
                    start,
                    end: Date.now(),
                    durationMs: Date.now() - start
                };
            }

            return response;
        } catch (error) {
            console.error(`[Gateway] Erro ao processar trace ${traceId}:`, error);
            throw error;
        }
    }
}
