export class RequestRouter {
    /**
     * O RequestRouter separa Queries puras (Search, Find) de
     * Commands (Update, Sync) e Events, encaminhando para o CommandBus.
     */
    constructor(commandBus) {
        this.commandBus = commandBus;
    }

    async route(payload, context) {
        // Verifica se é uma Query de Busca
        if (payload.query || payload.strategy) {
            // Empacota como SearchCommand
            const searchCommand = {
                type: 'SearchCommand',
                payload,
                context
            };
            return await this.commandBus.dispatch(searchCommand);
        }
        if (payload.capability === 'analyze_impact') {
            return await this.commandBus.dispatch({
                type: 'ImpactCommand',
                payload: payload.payload || payload,
                context
            });
        }

        // Verifica se é um Comando Específico de Explain, Trace, etc (futuro)
        if (payload.command === 'explain') {
            return await this.commandBus.dispatch({
                type: 'ExplainCommand',
                payload,
                context
            });
        }

        throw new Error("Formato de Request não reconhecido pelo Router.");
    }
}
