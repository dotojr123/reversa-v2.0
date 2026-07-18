import { Projection } from '../../../core/projection/Projection.js';
import fs from 'fs/promises';
import path from 'path';

export class MarkdownProjection extends Projection {
    constructor() {
        super('Markdown', 'MATERIALIZED');
    }

    async supports(event) {
        return event.type === 'KNOWLEDGE_UPDATED' || event.type === 'KNOWLEDGE_REMOVED';
    }

    async handleEvent(event) {
        if (!await this.supports(event)) return;

        const ko = event.payload;
        if (!ko || !ko.canonicalId) return;

        const outDir = path.join(process.cwd(), '.reversa', 'knowledge');
        await fs.mkdir(outDir, { recursive: true });

        const filePath = path.join(outDir, `${ko.canonicalId.replace(/[^a-z0-9_-]/gi, '_')}.md`);

        if (event.type === 'KNOWLEDGE_REMOVED') {
            try { await fs.unlink(filePath); } catch(e) {}
            return;
        }

        // KNOWLEDGE_UPDATED
        let content = `# [${ko.type}] ${ko.canonicalId}\n\n`;
        content += `**Business ID:** ${ko.businessId || 'N/A'}\n`;
        content += `**UUID:** ${ko.uuid}\n`;
        content += `**Confidence:** ${ko.confidenceScore}/100\n\n`;
        
        content += `## Content\n\n\`\`\`json\n${JSON.stringify(ko.content, null, 2)}\n\`\`\`\n\n`;
        
        if (ko.evidences && ko.evidences.length > 0) {
            content += `## Evidences (${ko.evidences.length})\n`;
            ko.evidences.forEach(e => {
                content += `- [${e.type}] ${e.source} (${e.confidence})\n`;
            });
            content += `\n`;
        }

        if (ko.conflicts && ko.conflicts.length > 0) {
            content += `## Conflicts (${ko.conflicts.length})\n`;
            ko.conflicts.forEach(c => {
                content += `- **${c.severity}**: ${c.description}\n`;
            });
            content += `\n`;
        }

        await fs.writeFile(filePath, content, 'utf8');
    }
}
