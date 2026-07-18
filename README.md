# Reversa KIP (Knowledge Intelligence Platform) v2.0
<small>Created exclusively for **IAgencia**</small>

**The ultimate episodic and structural memory framework for AI-assisted Software Engineering.**

> 🚀 **Reversa v2.0** evolves from a static documentation generator into a living, queryable, and predictive **Knowledge Operating System (KOS)**. It bridges the gap between massive codebases and AI Agents by providing sub-second contextual retrieval, impact analysis, and hybrid graphs.

---

## 🏛️ What is Reversa KIP?

AI Coding Agents (like Claude, GPT-4, and Cursor) are incredibly capable, but they lack **episodic memory** and **blast radius awareness** in large corporate systems. 

**Reversa KIP** is an orchestrator that extracts, indexes, and serves architectural knowledge dynamically. It exposes a unified **MCP (Model Context Protocol)** server so any AI agent can query your legacy systems, and a blazing-fast **Knowledge Studio** (Web UI) for tech leads to visualize dependencies and risks.

### Key Innovations in v2.0

1. **Dual-Speed Graph Architecture (Fast Lane & Slow Lane):**
   - **Fast Lane (Hard Edges):** Deterministic AST extractions, function calls, and module dependencies are mapped instantly.
   - **Slow Lane (Soft Edges):** Semantic relationships, architectural design decisions (ADRs), and implicit business rules are processed asynchronously via queues (`SQLiteQueueProvider`) to maintain peak performance.
2. **Hybrid Search Engine (SQLite FTS5 + Graphiti):**
   - Sub-millisecond lexical search via native SQLite FTS5 combined with semantic graph traversals via Graphiti, powered by our `RankingEngine` with temporal decay algorithms.
3. **Impact Analysis Engine (Blast Radius Prediction):**
   - Separates **Deterministic Risk** (code compilation breaks) from **Probabilistic Risk** (business rule side effects), returning a precise KOS-018 Impact Score.
4. **Unified Gateway:**
   - Both the MCP Server and the Knowledge Studio Web UI consume the exact same `RequestRouter` capabilities (`query`, `analyze_impact`). No duplicated logic, 100% auditable.

---

## 🛠️ The Technology Stack

- **Core & Runtime:** Node.js (Vanilla ES Modules), CommandBus pattern, Agnostic Gateway.
- **Graph & Semantic Memory:** `Graphiti` (Episodic memory) + `SQLite` (Relational & FTS5 Indexing).
- **Knowledge Studio (Web):** `Hono` (HTTP Server), Vanilla JS, Tailwind CSS, `Cytoscape.js` (Hardware-accelerated graph rendering with Dagre/CoSE layouts).
- **Agent Protocol:** Official MCP SDK for seamless integration with Claude Desktop, Cursor, and others.

---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/dotojr123/reversa-v2.0.git
cd reversa-v2.0

# Install dependencies
npm install
```

### 2. Booting the Knowledge Studio

The Knowledge Studio is a zero-config, highly visual dashboard designed for Tech Leads to inspect the codebase and run blast radius simulations.

```bash
# Start the Hono-backed Studio Server
node bin/reversa.js studio
```

Open your browser at `http://localhost:3000`. 
Try the **Impact Investigator** sidebar: input a component ID (e.g., `module::auth`), click *Analisar Impacto*, and watch the Cytoscape canvas isolate the blast radius with dynamic `.impact-critical` (Red) and `.impact-warning` (Orange) heatmaps.

### 3. Booting the MCP Server

Allow your AI agents (Claude, Cursor, etc.) to query the platform directly using the MCP Protocol.

```bash
# Start the MCP Server over stdio
node bin/reversa.js mcp
```

**Exposed MCP Tools:**
- `query_knowledge(query, strategy, edgeType)`: Searches the repository knowledge base (Hybrid/Semantic/Lexical).
- `analyze_impact(canonicalId, maxDepth)`: Returns the KOS-018 Blast Radius report for a specific module.

---

## 🧠 Architecture Overview

Reversa KIP follows a strictly decoupled, capability-driven architecture:

```text
       [MCP Client]               [Knowledge Studio UI]
           │                                │
           ▼                                ▼
    [MCPRuntime.js]                 [StudioServer.js]
           │                                │
           └─────────────┐  ┌───────────────┘
                         ▼  ▼
               [ Gateway (Unified) ]
                         │
                         ▼
                [ Request Router ]
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
  [SearchHandler]                [ImpactHandler]
          │                             │
          ▼                             ▼
[Hybrid Search Engine]          [Impact Analysis Engine]
 (FTS5 + Graphiti)               (BFS Graph Traversal)
```

### The KOS (Knowledge Object Schema) Standard
Every payload moving through the system strictly adheres to the KOS definitions (`docs/KOS-*.md`). 
For example, the Impact Engine enforces **KOS-018**, ensuring that risk reports always separate `deterministicBlastRadius` from `probabilisticRisks` along with a human-readable `ExplanationTree`.

---

## 💼 Built for IAgencia

This platform was re-architected and engineered from the ground up for **IAgencia**, transforming how legacy system modernization and AI-driven development are executed at enterprise scale.

Reversa v2.0 doesn't just read code; it understands the history, the reasons, and the risks behind every line.

---

## 🏛️ Provenance & Acknowledgements

This project, **Reversa KIP (Knowledge Intelligence Platform)**, is an independent derivative work built upon the foundation of [sandeco/reversa](https://github.com/sandeco/reversa). We have extended the original vision from a static documentation generator into a living, executable Knowledge Operating System (KOS) featuring hybrid graph memory, real-time impact analysis, and full MCP support. 

Original Reversa framework © Sandeco. Modifications, KOS architecture, and Knowledge Studio © IAgencia.

---

## License
MIT — see [LICENSE](LICENSE) for details.
