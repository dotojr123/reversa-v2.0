import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let dbInstance = null;

export function getDb(projectRoot = process.cwd()) {
    if (dbInstance) {
        return dbInstance;
    }

    const reversaDir = path.join(projectRoot, '.reversa');
    
    // Ensure directory exists
    if (!fs.existsSync(reversaDir)) {
        fs.mkdirSync(reversaDir, { recursive: true });
    }

    const dbPath = path.join(reversaDir, 'knowledge.db');
    
    dbInstance = new Database(dbPath, {
        // verbose: console.log
    });

    // Pragma for performance and reliability
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');

    return dbInstance;
}

export function closeDb() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}
