export class CommandBus {
    constructor() {
        this.handlers = new Map();
    }

    register(commandType, handlerInstance) {
        this.handlers.set(commandType, handlerInstance);
    }

    async dispatch(command) {
        const handler = this.handlers.get(command.type);
        if (!handler) {
            throw new Error(`Nenhum handler registrado para o comando: ${command.type}`);
        }
        return await handler.handle(command);
    }
}
