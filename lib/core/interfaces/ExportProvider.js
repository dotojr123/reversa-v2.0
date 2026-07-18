export class ExportProvider {
    /**
     * Verifica se o exporter suporta um determinado Knowledge Object.
     */
    supports(knowledgeObject) {
        throw new Error("Method not implemented.");
    }

    /**
     * Valida os dados antes da exportação.
     */
    validate(knowledgeObject) {
        throw new Error("Method not implemented.");
    }

    /**
     * Transforma o Knowledge Object em uma estrutura intermediária serializável ou raw content.
     */
    serialize(knowledgeObject) {
        throw new Error("Method not implemented.");
    }

    /**
     * Executa a exportação final (pode retornar string para o formatter/writer final).
     */
    export(serializedData) {
        throw new Error("Method not implemented.");
    }
}
