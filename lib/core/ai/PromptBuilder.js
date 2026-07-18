export class PromptBuilder {
    constructor(provider) {
        this.provider = provider; // ClaudeProvider, GPTProvider
    }

    buildSystemPrompt() {
        return this.provider.getSystemPrompt();
    }

    buildKnowledgePrompt(contextAssembly) {
        return this.provider.formatContext(contextAssembly);
    }

    buildTaskPrompt(taskDesc) {
        return this.provider.formatTask(taskDesc);
    }

    buildOutputPrompt(formatInstructions) {
        return this.provider.formatOutputInstruction(formatInstructions);
    }
}
