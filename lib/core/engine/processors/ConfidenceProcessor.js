import { EvidenceType } from '../../models/Evidence.js';

export class ConfidenceProcessor {
    /**
     * Calcula a confiança ponderada de um Knowledge Object.
     */
    static process(ko) {
        if (!ko.evidences || ko.evidences.length === 0) {
            ko.confidenceScore = 0;
            return;
        }

        // Fatores de peso de confiabilidade da fonte (Source Reliability)
        const sourceWeights = {
            [EvidenceType.SOURCE_CODE]: 1.0,
            [EvidenceType.TEST]: 0.95,
            [EvidenceType.API]: 0.90,
            [EvidenceType.DOCUMENT]: 0.70,
            [EvidenceType.USER]: 0.80,
            [EvidenceType.LLM]: 0.40,
            [EvidenceType.LOG]: 0.60
        };

        let totalScore = 0;
        let maxPossibleScore = 0;

        // Avaliações de Evidências (Source + Temporal base)
        const now = Date.now();
        ko.evidences.forEach(ev => {
            const weight = sourceWeights[ev.type] || 0.5;
            
            // Simula Temporal Score (evidências antigas sem updates valem menos, ou se recém gerada vale padrão)
            const ageMs = now - new Date(ev.timestamp).getTime();
            const ageDays = ageMs / (1000 * 60 * 60 * 24);
            const temporalFactor = ageDays > 30 ? 0.9 : 1.0; // Perde 10% se for velha e não renovada
            
            const evBaseConfidence = ev.confidence || 50; // Se não veio, assume média
            
            totalScore += (evBaseConfidence * weight * temporalFactor);
            maxPossibleScore += (100 * weight);
        });

        // Cross Agent bônus: Múltiplas fontes aumentam a confiança
        const uniqueSources = new Set(ko.evidences.map(e => e.type)).size;
        let finalScore = (totalScore / maxPossibleScore) * 100;
        
        if (uniqueSources > 1) finalScore += 5; // Bônus
        if (uniqueSources > 2) finalScore += 5; // Bônus duplo
        
        // Penalidade por conflitos abertos
        if (ko.conflicts && ko.conflicts.length > 0) {
            finalScore -= (ko.conflicts.length * 20); 
        }

        ko.confidenceScore = Math.max(0, Math.min(100, Math.round(finalScore)));
    }
}
