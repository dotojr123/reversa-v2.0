import { Conflict, ConflictType, ConflictSeverity } from '../../models/Conflict.js';

export class ConflictProcessor {
    /**
     * Detecta conflitos estritos entre o incomingKo e o targetKo.
     * Na fundação (Fase 1.5), focamos em conflitos estruturais lógicos
     * ex: O incomingKo e o targetKo possuem mesmo Canonical ID mas hashes diferentes ou props booleanas invertidas.
     */
    static process(targetKo, incomingKo) {
        if (targetKo === incomingKo) return;

        // Se eles caíram no mesmo targetKo via Canonical ID mas o conteúdo é estruturalmente diferente,
        // levantamos um conflito potencial (Semantic/Structural).
        if (targetKo.canonicalId === incomingKo.canonicalId) {
            const hasStructuralDiff = JSON.stringify(targetKo.content) !== JSON.stringify(incomingKo.content);
            if (hasStructuralDiff) {
                const conflict = new Conflict({
                    severity: ConflictSeverity.HIGH,
                    type: ConflictType.STRUCTURAL,
                    ruleA: targetKo.uuid,
                    ruleB: incomingKo.uuid, // Embora não será persistido separadamente, usamos o UUID pra rastro
                    reason: `Descoberta divergência estrutural para o Canonical ID '${targetKo.canonicalId}'`
                });
                
                targetKo.addConflict(conflict.id);
                // NOTA: Em produção real o conflito seria persistido via Repository
                // Aqui apenas amarramos no objeto alvo.
            }
        }
    }
}
