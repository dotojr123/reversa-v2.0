/**
 * @class ContextAssembly
 * @description Pega o Top N consolidado do Ranking e renderiza em Markdown compacto.
 */
export class ContextAssembly {
  /**
   * Formata os resultados finais para injeção no prompt do LLM
   * @param {Object} rankedData - Retorno do RankingEngine.rank()
   * @returns {string} Markdown renderizado
   */
  assemble(rankedData) {
    const { knowledge, explanationTree } = rankedData;

    if (!knowledge || knowledge.length === 0) {
        return "_Nenhum conhecimento relevante encontrado._";
    }

    let markdown = "### Contexto Injetado do Reversa KOS\n\n";

    knowledge.forEach((item, index) => {
        const type = item.type || 'UNKNOWN';
        const score = (item.finalScore * 100).toFixed(1);
        const name = item.canonicalId.split('::').pop();
        
        markdown += `#### [${type}] ${name} (Score: ${score})\n`;
        markdown += `**ID:** \`${item.canonicalId}\`\n`;
        
        if (item.content && item.content.code) {
            markdown += "```javascript\n" + item.content.code + "\n```\n";
        } else if (item.content && item.content.summary) {
            markdown += `> ${item.content.summary}\n`;
        }

        // Justificativa
        const exp = explanationTree.items.find(i => i.id === item.canonicalId);
        if (exp && exp.why.length > 0) {
            markdown += `_Origem:_ ${exp.why.join(" | ")}\n`;
        }
        
        markdown += "\n---\n\n";
    });

    return markdown;
  }
}
