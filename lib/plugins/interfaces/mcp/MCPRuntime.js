import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

export class MCPRuntime {
    /**
     * Adaptador do Model Context Protocol. 
     * Ele implementa todo o contrato oficial de MCP,
     * usando o SDK oficial, e conectando ao `Knowledge Gateway`.
     */
    constructor(gateway) {
        this.gateway = gateway;
        this.server = new Server(
            {
                name: "reversa-mcp-server",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );
        this._setupHandlers();
    }

    _setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: "query_knowledge",
                        description: "Searches the Reversa KIP for architectural knowledge",
                        inputSchema: {
                            type: "object",
                            properties: {
                                query: { type: "string" },
                                strategy: { type: "string" },
                                edgeType: { type: "string", enum: ["hard", "soft", "all"], description: "Filtrar por arestas estruturais (hard), semânticas (soft) ou ambas." }
                            },
                            required: ["query"]
                        },
                    },
                    {
                        name: "analyze_impact",
                        description: "Analyzes the blast radius and business risk of changing a specific component.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                canonicalId: { type: "string" },
                                maxDepth: { type: "number" },
                                confidenceThreshold: { type: "number" }
                            },
                            required: ["canonicalId"]
                        }
                    }
                ],
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (request.params.name === "query_knowledge") {
                const args = request.params.arguments;
                const payload = {
                    capability: 'query',
                    payload: {
                        query: args.query,
                        strategy: args.strategy || "hybrid",
                        edgeType: args.edgeType || "all",
                        limit: 10
                    }
                };
                
                try {
                    const response = await this.gateway.handleRequest(payload);
                    return {
                        content: [{
                            type: 'text',
                            text: typeof response === 'string' ? response : JSON.stringify(response, null, 2)
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Error executing query: ${error.message}`
                        }],
                        isError: true
                    };
                }
            } else if (request.params.name === "analyze_impact") {
                const args = request.params.arguments;
                const payload = {
                    capability: 'analyze_impact',
                    payload: {
                        canonicalId: args.canonicalId,
                        maxDepth: args.maxDepth || 3,
                        confidenceThreshold: args.confidenceThreshold || 0.7
                    }
                };
                
                try {
                    const response = await this.gateway.handleRequest(payload);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(response, null, 2)
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Error executing impact analysis: ${error.message}`
                        }],
                        isError: true
                    };
                }
            }
            throw new Error(`Tool not found: ${request.params.name}`);
        });
    }

    async start(transportType = 'stdio') {
        console.error(`[MCP] Iniciando runtime via transport: ${transportType}`);
        if (transportType === 'stdio') {
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            console.error('[MCP] Server connected on stdio transport');
        } else {
            throw new Error(`Transport ${transportType} not supported yet.`);
        }
    }
}
