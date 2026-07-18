export class ExportPipeline {
    constructor(exporter, writer) {
        this.exporter = exporter;
        this.writer = writer; // Writer is responsible for saving the formatted string to disk/network
    }

    async process(knowledgeObject) {
        if (!this.exporter.supports(knowledgeObject)) {
            console.warn(`Exporter não suporta o KO do tipo ${knowledgeObject.type}`);
            return;
        }

        // 1. Validation
        this.exporter.validate(knowledgeObject);

        // 2. Normalizer / Serialize
        const serialized = this.exporter.serialize(knowledgeObject);

        // 3. Exporter / Formatter
        const formattedContent = this.exporter.export(serialized);

        // 4. Writer
        if (this.writer) {
            await this.writer.write(knowledgeObject.businessId, formattedContent);
        }
        
        return formattedContent;
    }
}
