import { EventEmitter } from 'events';

export class ProjectionEngine {
    /**
     * Motor de Projeções Baseado em Eventos CQRS
     * Subscreve-se ao Event Bus do Knowledge Core e despacha
     * 'KnowledgeUpdated' para todos os plugins de Projeção registrados.
     */
    constructor() {
        this.bus = new EventEmitter();
        this.projections = new Map(); // name -> ProjectionInstance
    }

    register(projection) {
        if (!projection.name || typeof projection.handleEvent !== 'function') {
            throw new Error("Invalid projection. Must implement handleEvent(event).");
        }
        this.projections.set(projection.name, projection);
    }

    /**
     * Ponto de entrada de eventos de domínio gerados pelo KnowledgeService
     */
    emit(event) {
        // event { type: 'KNOWLEDGE_UPDATED', payload: KnowledgeObject, timestamp }
        this.bus.emit('event', event);
        
        // Despacha para todas as projeções registradas assincronamente
        this.projections.forEach(projection => {
            setImmediate(() => {
                projection.handleEvent(event).catch(err => {
                    console.error(`[ProjectionEngine] Error in projection ${projection.name}:`, err);
                });
            });
        });
    }
}
