export class ImpactRankingEngine {
    rank(impactReport) {
        let score = 0;
        
        // Peso de Hard Edges
        score += impactReport.deterministicBlastRadius.length * 2.0;

        // Peso de Soft Edges ponderado por confiança
        for (const risk of impactReport.probabilisticRisks) {
            score += risk.confidence * 1.0;
        }

        // Explanation Tree simplificada
        const explanationTree = {
            strategy: "hybrid_impact",
            summary: `Risco de Impacto. Quebra estrutural em ${impactReport.deterministicBlastRadius.length} componente(s) e similaridade de risco com ${impactReport.probabilisticRisks.length} componente(s).`
        };

        return {
            ...impactReport,
            impactScore: Number(score.toFixed(2)),
            explanationTree
        };
    }
}
