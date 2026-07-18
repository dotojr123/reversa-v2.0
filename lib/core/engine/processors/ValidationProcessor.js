export class ValidationProcessor {
    /**
     * Valida um KnowledgeObject antes de entrar no Engine
     * @param {KnowledgeObject} ko
     */
    static validate(ko) {
        const errors = [];

        if (!ko.uuid) errors.push('UUID is required.');
        if (!ko.businessId && !ko.canonicalId) errors.push('At least Business ID or Canonical ID must be provided.');
        if (!ko.type) errors.push('Type is required.');
        if (ko.confidenceScore < 0 || ko.confidenceScore > 100) errors.push('Confidence Score must be between 0 and 100.');
        
        // Validação de evidências
        if (ko.evidences && Array.isArray(ko.evidences)) {
            ko.evidences.forEach((ev, idx) => {
                if (!ev.id) errors.push(`Evidence [${idx}] is missing ID.`);
                if (!ev.type) errors.push(`Evidence [${idx}] is missing Type.`);
                if (ev.confidence < 0 || ev.confidence > 100) errors.push(`Evidence [${idx}] Confidence must be between 0 and 100.`);
            });
        }

        if (errors.length > 0) {
            throw new Error(`Validation Error on Knowledge Object ${ko.uuid}:\n- ` + errors.join('\n- '));
        }

        return true;
    }
}
