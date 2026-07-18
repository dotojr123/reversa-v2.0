import { MCPRuntime } from '../plugins/interfaces/mcp/MCPRuntime.js';
import { SQLiteStorage } from '../core/storage/SQLiteStorage.js';
import { GraphitiProvider } from '../plugins/graph/graphiti/GraphitiProvider.js';
import { SearchEngine } from '../core/retrieval/SearchEngine.js';
import { QueryPlanner } from '../core/retrieval/QueryPlanner.js';
import { RankingEngine } from '../core/retrieval/RankingEngine.js';
import { ContextAssembly } from '../core/retrieval/ContextAssembly.js';
import { ImpactService } from '../core/ai/ImpactService.js';
import { ImpactRankingEngine } from '../core/ai/ImpactRankingEngine.js';

import { Gateway } from '../core/runtime/Gateway.js';
import { RequestRouter } from '../core/runtime/RequestRouter.js';
import { CommandBus } from '../core/runtime/CommandBus.js';
import { SearchHandler } from '../core/runtime/handlers/SearchHandler.js';
import { ImpactHandler } from '../core/runtime/handlers/ImpactHandler.js';

export default async function mcpCommand(args) {
    const dbPath = '.reversa/knowledge.db';
    const sqliteStorage = new SQLiteStorage(dbPath);
    await sqliteStorage.init();
    
    const graphProvider = new GraphitiProvider();
    
    const searchEngine = new SearchEngine(sqliteStorage, graphProvider);
    const queryPlanner = new QueryPlanner(searchEngine);
    const rankingEngine = new RankingEngine();
    const contextAssembly = new ContextAssembly();
    
    const impactService = new ImpactService(graphProvider);
    const impactRankingEngine = new ImpactRankingEngine();

    // 1. Setup CommandBus & Handlers
    const commandBus = new CommandBus();
    const queryPipeline = { execute: async (plan) => contextAssembly.assemble(await rankingEngine.rank(plan.rawResults)) };
    
    commandBus.register('SearchCommand', new SearchHandler(queryPlanner, queryPipeline, { startTrace: () => ({ startSpan: () => ({ end: () => {} }), end: () => {}, getSpans: () => [] }) }));
    commandBus.register('ImpactCommand', new ImpactHandler({ impactService, rankingEngine: impactRankingEngine }));

    // 2. Setup Router & Gateway
    const requestRouter = new RequestRouter(commandBus);
    const gateway = new Gateway(requestRouter);
    
    const mcp = new MCPRuntime(gateway);
    await mcp.start('stdio');
}
