export class TraceEngine {
    /**
     * Engine agnóstica para Observabilidade. Implementa a especificação KOS-013.
     */
    constructor() {
        this.activeTraces = new Map();
    }

    startTrace(traceId = crypto.randomUUID(), rootName = 'root') {
        const trace = new Trace(traceId, rootName);
        this.activeTraces.set(traceId, trace);
        return trace;
    }

    getTrace(traceId) {
        return this.activeTraces.get(traceId);
    }
}

class Trace {
    constructor(traceId, rootName) {
        this.traceId = traceId;
        this.rootName = rootName;
        this.spans = {};
        this.startTs = Date.now();
        this.endTs = null;
        this.error = null;
    }

    startSpan(name) {
        const span = { start: Date.now(), end: null, durationMs: null };
        this.spans[name] = span;
        
        return {
            end: () => {
                span.end = Date.now();
                span.durationMs = span.end - span.start;
            }
        };
    }

    end() {
        this.endTs = Date.now();
    }

    endWithError(err) {
        this.endTs = Date.now();
        this.error = err.message;
    }

    getSpans() {
        return this.spans;
    }

    getReport() {
        return {
            traceId: this.traceId,
            root: this.rootName,
            start: this.startTs,
            end: this.endTs,
            durationMs: this.endTs ? this.endTs - this.startTs : null,
            error: this.error,
            spans: this.spans
        };
    }
}
