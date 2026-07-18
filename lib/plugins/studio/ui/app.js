import { GraphVisualizer } from './components/GraphVisualizer.js';
import { ImpactInvestigator } from './components/ImpactInvestigator.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Studio] Inicializando Knowledge Studio...');

    // 1. Instancia o visualizador de Grafo
    const graphVisualizer = new GraphVisualizer('cy');
    await graphVisualizer.loadGraph();

    // 2. Instancia o investigador de impacto e o liga ao grafo
    const impactInvestigator = new ImpactInvestigator(graphVisualizer);

    // 3. Setup de eventos da UI
    document.getElementById('btn-layout-cose').addEventListener('click', () => graphVisualizer.setLayout('cose'));
    document.getElementById('btn-layout-dagre').addEventListener('click', () => graphVisualizer.setLayout('dagre'));
    
    // Toggle Hard/Soft
    let showHard = true;
    let showSoft = true;
    
    document.getElementById('btn-filter-hard').addEventListener('click', (e) => {
        showHard = !showHard;
        e.target.classList.toggle('bg-slate-700');
        e.target.classList.toggle('bg-slate-900');
        e.target.classList.toggle('text-slate-500');
        graphVisualizer.filterEdges(showHard, showSoft);
    });

    document.getElementById('btn-filter-soft').addEventListener('click', (e) => {
        showSoft = !showSoft;
        e.target.classList.toggle('bg-slate-700');
        e.target.classList.toggle('bg-slate-900');
        e.target.classList.toggle('text-slate-500');
        graphVisualizer.filterEdges(showHard, showSoft);
    });
});
