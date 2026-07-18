export class EvidenceProcessor {
    /**
     * Mescla as evidências do novo KO no KO alvo (existente ou o mesmo).
     */
    static process(targetKo, incomingKo) {
        if (targetKo === incomingKo) {
            // Não é merge, apenas garante que evidences existam
            if (!targetKo.evidences) targetKo.evidences = [];
            return targetKo;
        }

        // Se for Merge
        if (incomingKo.evidences && Array.isArray(incomingKo.evidences)) {
            incomingKo.evidences.forEach(ev => {
                // Previne evidências duplicadas simples (mesmo ID ou mesmo hash/conteúdo)
                const alreadyExists = targetKo.evidences.find(e => e.id === ev.id || (e.raw === ev.raw && e.source === ev.source));
                if (!alreadyExists) {
                    targetKo.addEvidence(ev);
                }
            });
        }
        
        return targetKo;
    }
}
