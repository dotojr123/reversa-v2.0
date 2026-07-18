import chokidar from 'chokidar';
import chalk from 'chalk';
import path from 'path';
import { initializeSchema } from '../sqlite/schema.js';
import { hasFileChanged, updateFileHash } from '../hash/incremental.js';

export function runWatch(projectRoot = process.cwd()) {
    console.log(chalk.cyan('Inicializando Reversa 2.0 Watch Mode...'));
    
    // Assegura que as tabelas SQLite existem
    initializeSchema(projectRoot);

    // Ignora node_modules, pasta do reversa, arquivos escondidos etc
    const ignoredPaths = [
        /(^|[\/\\])\../, // arquivos/pastas com ponto (ex: .git, .reversa)
        /node_modules/,
        /dist/,
        /build/
    ];

    const watcher = chokidar.watch(projectRoot, {
        ignored: ignoredPaths,
        persistent: true,
        ignoreInitial: false
    });

    watcher
        .on('add', filePath => handleFileChange('add', filePath, projectRoot))
        .on('change', filePath => handleFileChange('change', filePath, projectRoot))
        .on('unlink', filePath => {
            // Pode implementar logica de apagar dados no banco futuramente
            console.log(chalk.yellow(`[WATCH] Arquivo removido: ${path.relative(projectRoot, filePath)}`));
        });

    console.log(chalk.green('✔ Watch mode ativado. Monitorando alterações...'));

    return watcher;
}

function handleFileChange(event, filePath, projectRoot) {
    if (hasFileChanged(filePath, projectRoot)) {
        console.log(chalk.blue(`[WATCH] ${event}: ${path.relative(projectRoot, filePath)} - Hash modificado.`));
        updateFileHash(filePath, projectRoot);
        
        // Futuro: Iniciar análise incremental aqui para atualizar banco / markdown
        // analyzeModuleIncremental(filePath);
    }
}
