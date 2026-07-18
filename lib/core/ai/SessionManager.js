export class SessionManager {
    /**
     * Gerencia hierarquia Workspace -> Repository -> Branch -> Session
     */
    constructor() {
        // ID -> Workspace
        this.workspaces = new Map();
    }

    createSession(workspaceId, repoId, branchName, sessionId) {
        if (!this.workspaces.has(workspaceId)) {
            this.workspaces.set(workspaceId, { repositories: new Map() });
        }
        
        const ws = this.workspaces.get(workspaceId);
        if (!ws.repositories.has(repoId)) {
            ws.repositories.set(repoId, { branches: new Map() });
        }

        const repo = ws.repositories.get(repoId);
        if (!repo.branches.has(branchName)) {
            repo.branches.set(branchName, { sessions: new Map() });
        }

        const branch = repo.branches.get(branchName);
        if (!branch.sessions.has(sessionId)) {
            branch.sessions.set(sessionId, {
                history: [],
                createdAt: Date.now()
            });
        }

        return branch.sessions.get(sessionId);
    }

    getSession(workspaceId, repoId, branchName, sessionId) {
        try {
            return this.workspaces.get(workspaceId).repositories.get(repoId).branches.get(branchName).sessions.get(sessionId);
        } catch (e) {
            return null;
        }
    }

    addHistory(workspaceId, repoId, branchName, sessionId, interaction) {
        const session = this.getSession(workspaceId, repoId, branchName, sessionId);
        if (session) {
            session.history.push({
                ...interaction,
                timestamp: Date.now()
            });
        }
    }
}
