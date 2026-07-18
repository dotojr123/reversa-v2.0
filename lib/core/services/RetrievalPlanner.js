export class RetrievalPlanner {
    /**
     * O RetrievalPlanner avalia o payload KOS-008 e produz
     * um KOS-012 Execution Plan com os passos exatos do pipeline.
     */
    plan(payload) {
        let strategy = payload.strategy;

        // Inferência simples caso omitida
        if (!strategy) {
            if (payload.query && payload.query.includes('como funciona')) {
                strategy = 'hybrid';
            } else if (payload.query && payload.query.includes('onde existe')) {
                strategy = 'keyword';
            } else {
                strategy = 'keyword'; // default
            }
        }

        const steps = [];

        switch (strategy) {
            case 'keyword':
                steps.push('keyword', 'ranking', 'explanation');
                break;
            case 'graph':
                steps.push('graph', 'ranking', 'explanation');
                break;
            case 'hybrid':
                steps.push('keyword', 'graph', 'ranking', 'explanation');
                break;
            case 'semantic':
                steps.push('semantic', 'ranking', 'explanation');
                break;
            default:
                steps.push('keyword', 'ranking');
        }

        return {
            planner: strategy,
            steps,
            parameters: {
                limit: payload.limit || 20,
                depth: payload.depth || 3
            },
            fallbacks: ["temporal"]
        };
    }
}
