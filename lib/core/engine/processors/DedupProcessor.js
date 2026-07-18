import crypto from 'crypto';

export class DedupProcessor {
    constructor(repository) {
        this.repository = repository;
    }

    /**
     * Processa deduplicação. Se encontrar um KO existente (via Structural Hash ou Canonical ID),
     * retorna o KO existente atualizado para receber o merge. Se for novo, retorna o próprio.
     */
    async process(ko) {
        const structuralHash = this._generateStructuralHash(ko.content);
        
        // Simulação de busca no repositório por Structural Hash ou Canonical ID
        // Como o StorageProvider atual não tem query complexa, vamos supor um fetch simulado.
        const existingKo = await this.repository.findByHashOrCanonical(structuralHash, ko.canonicalId);
        
        if (existingKo) {
            // Se encontrou, marca o existingKo como alvo do merge
            return {
                target: existingKo,
                isMerge: true
            };
        }
        
        // Salva o hash no objeto temporariamente para uso futuro (ex: busca)
        ko._structuralHash = structuralHash;
        
        return {
            target: ko,
            isMerge: false
        };
    }

    _generateStructuralHash(content) {
        // Gera um hash determinístico do conteúdo estrito
        const str = JSON.stringify(content, Object.keys(content).sort());
        return crypto.createHash('sha256').update(str).digest('hex');
    }
}
