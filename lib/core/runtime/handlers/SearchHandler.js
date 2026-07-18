export class SearchHandler {
    constructor(retrievalPlanner, retrievalPipeline, traceEngine) {
        this.planner = retrievalPlanner;
        this.pipeline = retrievalPipeline;
        this.traceEngine = traceEngine;
    }

    async handle(command) {
        const { payload, context } = command;
        const trace = this.traceEngine.startTrace(context.traceId, 'SearchHandler');
        
        try {
            // 1. O Planner cria o Execution Plan (KOS-012)
            const planSpan = trace.startSpan('planner');
            const executionPlan = await this.planner.plan(payload);
            planSpan.end();

            // 2. O Pipeline executa os steps do plano em cadeia
            const pipelineSpan = trace.startSpan('pipeline');
            const result = await this.pipeline.execute(executionPlan, payload);
            pipelineSpan.end();

            trace.end();

            // Retorna o KOS-009 com as métricas incluídas
            result.metrics = { spans: trace.getSpans() };
            return result;
        } catch (err) {
            trace.endWithError(err);
            throw err;
        }
    }
}
