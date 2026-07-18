import { PromptProvider } from './PromptProvider.js';

export class ClaudeProvider extends PromptProvider {
    getSystemPrompt() {
        return `You are Claude, a software engineering intelligence agent...`;
    }
    
    formatContext(contextAssembly) {
        // Claude costuma lidar bem com XML tags
        let prompt = `<knowledge_context>\n`;
        
        if (contextAssembly.rules && contextAssembly.rules.length > 0) {
            prompt += `<business_rules>\n`;
            contextAssembly.rules.forEach(r => prompt += `- ${r.content || r.canonicalId}\n`);
            prompt += `</business_rules>\n`;
        }

        if (contextAssembly.graph && contextAssembly.graph.length > 0) {
            prompt += `<architecture_graph>\n`;
            contextAssembly.graph.forEach(g => prompt += `${g}\n`);
            prompt += `</architecture_graph>\n`;
        }

        prompt += `</knowledge_context>\n`;
        return prompt;
    }

    formatTask(taskDesc) {
        return `<task>\n${taskDesc}\n</task>\n`;
    }

    formatOutputInstruction(format) {
        return `Please output your response exactly as requested:\n${format}`;
    }
}
