export class ImpactInvestigator {
    constructor(graphVisualizer) {
        this.graphVisualizer = graphVisualizer;
        
        this.btnAnalyze = document.getElementById('btn-analyze-impact');
        this.btnClear = document.getElementById('btn-clear-impact');
        this.inputTarget = document.getElementById('impact-target');
        
        this.resultsPanel = document.getElementById('impact-results');
        this.scoreBadge = document.getElementById('impact-score');
        this.listHard = document.getElementById('list-hard-impacts');
        this.listSoft = document.getElementById('list-soft-risks');
        this.explanationBox = document.getElementById('impact-explanation');

        this.bindEvents();
    }

    bindEvents() {
        this.btnAnalyze.addEventListener('click', () => this.analyzeImpact());
        this.btnClear.addEventListener('click', () => this.clearImpact());
        
        this.inputTarget.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.analyzeImpact();
        });
    }

    async analyzeImpact() {
        const canonicalId = this.inputTarget.value.trim();
        if (!canonicalId) return;

        this.btnAnalyze.disabled = true;
        this.btnAnalyze.innerHTML = `<span class="animate-pulse">Calculando Risco...</span>`;

        try {
            const response = await fetch('/api/runtime', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    capability: 'analyze_impact',
                    payload: { canonicalId, maxDepth: 3, confidenceThreshold: 0.6 }
                })
            });

            const data = await response.json();
            
            if (data.status === 'SUCCESS' && data.payload) {
                this.renderResults(data.payload);
                this.graphVisualizer.applyImpactHeatmap(canonicalId, data.payload);
            } else {
                console.error('[ImpactInvestigator] Erro na resposta:', data);
                alert(data.error || 'Erro ao calcular impacto.');
            }
        } catch (err) {
            console.error('[ImpactInvestigator] Falha na requisição:', err);
            alert('Falha de conexão com o Runtime.');
        } finally {
            this.btnAnalyze.disabled = false;
            this.btnAnalyze.innerHTML = `<span>Analisar Impacto</span>`;
        }
    }

    renderResults(report) {
        this.resultsPanel.classList.remove('hidden');
        
        // Atualiza Score
        this.scoreBadge.textContent = report.impactScore.toFixed(2);
        
        // Preenche Hard Impacts
        this.listHard.innerHTML = '';
        if (report.deterministicBlastRadius.length === 0) {
            this.listHard.innerHTML = '<li class="text-xs text-slate-500 italic">Nenhum componente diretamente afetado.</li>';
        } else {
            report.deterministicBlastRadius.forEach(item => {
                this.listHard.innerHTML += `<li class="text-xs text-slate-300 py-0.5"><span class="font-mono text-slate-400 mr-1">${item.type}</span> ${item.canonicalId}</li>`;
            });
        }

        // Preenche Soft Risks
        this.listSoft.innerHTML = '';
        if (report.probabilisticRisks.length === 0) {
            this.listSoft.innerHTML = '<li class="text-xs text-slate-500 italic">Nenhum risco de negócio mapeado.</li>';
        } else {
            report.probabilisticRisks.forEach(item => {
                this.listSoft.innerHTML += `<li class="text-xs text-slate-300 py-0.5 flex justify-between items-center">
                    <span><span class="font-mono text-slate-400 mr-1">${item.type}</span> ${item.canonicalId}</span>
                    <span class="text-[10px] bg-slate-800 px-1 rounded">${(item.confidence * 100).toFixed(0)}%</span>
                </li>`;
            });
        }

        // Explanation
        this.explanationBox.textContent = report.explanationTree.summary;
    }

    clearImpact() {
        this.inputTarget.value = '';
        this.resultsPanel.classList.add('hidden');
        this.graphVisualizer.clearImpactHeatmap();
    }
}
