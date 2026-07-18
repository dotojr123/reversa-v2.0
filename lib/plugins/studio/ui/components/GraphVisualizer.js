export class GraphVisualizer {
    constructor(containerId) {
        this.containerId = containerId;
        this.cy = null;
    }

    async loadGraph() {
        try {
            const response = await fetch('/api/graph');
            const data = await response.json();
            
            const elements = [];
            
            // Mapeia Nós
            data.results.forEach(n => {
                elements.push({
                    data: { id: n.id || n.canonicalId, label: (n.id || n.canonicalId).split('::').pop(), type: n.type }
                });
            });

            // Mapeia Arestas
            data.edges.forEach(e => {
                elements.push({
                    data: { 
                        id: `${e.source}-${e.target}-${e.type}`,
                        source: e.source, 
                        target: e.target,
                        label: e.type,
                        isSoft: (e.type === 'RELATES_TO' || e.type === 'SIMILAR_TO')
                    }
                });
            });

            this.initCytoscape(elements);
        } catch (err) {
            console.error('[GraphVisualizer] Falha ao carregar grafo:', err);
        }
    }

    initCytoscape(elements) {
        this.cy = cytoscape({
            container: document.getElementById(this.containerId),
            elements: elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#3b82f6', // blue-500
                        'label': 'data(label)',
                        'color': '#cbd5e1',
                        'font-size': '10px',
                        'text-valign': 'bottom',
                        'text-margin-y': '5px',
                        'transition-property': 'background-color, opacity, border-width, border-color',
                        'transition-duration': '0.3s'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 1.5,
                        'line-color': '#475569',
                        'target-arrow-color': '#475569',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'opacity': 0.6,
                        'transition-property': 'opacity, line-color',
                        'transition-duration': '0.3s'
                    }
                },
                {
                    selector: 'edge[?isSoft]',
                    style: {
                        'line-style': 'dashed',
                        'line-color': '#8b5cf6', // violet-500
                        'target-arrow-color': '#8b5cf6',
                        'opacity': 0.4
                    }
                },
                // === IMPACT STYLES ===
                {
                    selector: '.faded',
                    style: {
                        'opacity': 0.15
                    }
                },
                {
                    selector: '.impact-target',
                    style: {
                        'background-color': '#ffffff',
                        'border-width': 4,
                        'border-color': '#3b82f6',
                        'opacity': 1,
                        'width': 35,
                        'height': 35
                    }
                },
                {
                    selector: '.impact-critical',
                    style: {
                        'background-color': '#ef4444', // red-500
                        'border-width': 3,
                        'border-color': '#7f1d1d', // red-900
                        'opacity': 1
                    }
                },
                {
                    selector: '.impact-warning',
                    style: {
                        'background-color': '#f97316', // orange-500
                        'border-width': 2,
                        'border-color': '#7c2d12', // orange-900
                        'opacity': 1
                    }
                },
                {
                    selector: 'edge.impact-edge-hard',
                    style: {
                        'line-color': '#ef4444',
                        'target-arrow-color': '#ef4444',
                        'width': 3,
                        'opacity': 0.9
                    }
                },
                {
                    selector: 'edge.impact-edge-soft',
                    style: {
                        'line-color': '#f97316',
                        'target-arrow-color': '#f97316',
                        'width': 2,
                        'opacity': 0.8
                    }
                }
            ],
            layout: {
                name: 'cose',
                animate: true,
                padding: 50
            }
        });

        // Click listener for investigation
        this.cy.on('tap', 'node', (evt) => {
            const nodeId = evt.target.id();
            const inputTarget = document.getElementById('impact-target');
            if (inputTarget) {
                inputTarget.value = nodeId;
                // Auto trigger analyze (simulated by triggering click)
                document.getElementById('btn-analyze-impact').click();
            }
        });
    }

    setLayout(layoutName) {
        if (this.cy) {
            const layout = this.cy.layout({
                name: layoutName,
                animate: true,
                padding: 50
            });
            layout.run();
        }
    }

    filterEdges(showHard, showSoft) {
        if (!this.cy) return;
        
        this.cy.edges().forEach(e => {
            const isSoft = e.data('isSoft');
            if (isSoft) {
                e.style('display', showSoft ? 'element' : 'none');
            } else {
                e.style('display', showHard ? 'element' : 'none');
            }
        });
    }

    applyImpactHeatmap(targetId, impactReport) {
        if (!this.cy) return;
        
        // 1. Fade ALL elements
        this.cy.elements().addClass('faded');
        this.cy.elements().removeClass('impact-target impact-critical impact-warning impact-edge-hard impact-edge-soft');

        // 2. Highlight Target
        const targetNode = this.cy.getElementById(targetId);
        if (targetNode.length > 0) {
            targetNode.removeClass('faded').addClass('impact-target');
        }

        // 3. Highlight Hard Impacts (Critical)
        impactReport.deterministicBlastRadius.forEach(item => {
            const node = this.cy.getElementById(item.canonicalId);
            if (node.length > 0) {
                node.removeClass('faded').addClass('impact-critical');
                
                // Try to find the edge connecting them and highlight it
                const edges = node.connectedEdges(`[source = "${targetId}"], [target = "${targetId}"]`);
                edges.removeClass('faded').addClass('impact-edge-hard');
            }
        });

        // 4. Highlight Soft Risks (Warning)
        impactReport.probabilisticRisks.forEach(item => {
            const node = this.cy.getElementById(item.canonicalId);
            if (node.length > 0) {
                // If it's already critical, keep it critical. Else warning.
                if (!node.hasClass('impact-critical')) {
                    node.removeClass('faded').addClass('impact-warning');
                    
                    const edges = node.connectedEdges(`[source = "${targetId}"], [target = "${targetId}"]`);
                    edges.removeClass('faded').addClass('impact-edge-soft');
                }
            }
        });
        
        // Ensure connected edges between any highlighted nodes are somewhat visible
        // (This is a simplified highlight logic)
    }

    clearImpactHeatmap() {
        if (!this.cy) return;
        this.cy.elements().removeClass('faded impact-target impact-critical impact-warning impact-edge-hard impact-edge-soft');
    }
}
