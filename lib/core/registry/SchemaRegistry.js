export class SchemaRegistry {
    constructor() {
        // Ex: "KOS-015" -> { version: 1, validator: fn() }
        this.schemas = new Map();
    }

    register(schemaName, version, validatorFn = null) {
        if (this.schemas.has(schemaName)) {
            const current = this.schemas.get(schemaName);
            if (version <= current.version) return; // ignora older versions
        }
        
        this.schemas.set(schemaName, { version, validator: validatorFn });
    }

    getSchema(schemaName) {
        return this.schemas.get(schemaName);
    }

    async validate(schemaName, payload) {
        const schema = this.schemas.get(schemaName);
        if (!schema) throw new Error(`Schema ${schemaName} not found in Registry.`);
        if (schema.validator) {
            return await schema.validator(payload);
        }
        return true; // sem validador strict ainda
    }
}
