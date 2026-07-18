import { getDb } from './db.js';

export function initializeSchema(projectRoot = process.cwd()) {
    const db = getDb(projectRoot);

    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT,
            path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS modules (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            name TEXT,
            language TEXT,
            path TEXT,
            hash TEXT,
            last_scan DATETIME DEFAULT CURRENT_TIMESTAMP,
            confidence INTEGER DEFAULT 0,
            FOREIGN KEY(project_id) REFERENCES projects(id)
        );

        CREATE TABLE IF NOT EXISTS business_rules (
            id TEXT PRIMARY KEY,
            module_id TEXT,
            title TEXT,
            description TEXT,
            confidence TEXT,
            source_file TEXT,
            source_line INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(module_id) REFERENCES modules(id)
        );

        CREATE TABLE IF NOT EXISTS entities (
            id TEXT PRIMARY KEY,
            name TEXT,
            type TEXT,
            description TEXT
        );

        CREATE TABLE IF NOT EXISTS endpoints (
            id TEXT PRIMARY KEY,
            module_id TEXT,
            method TEXT,
            route TEXT,
            request TEXT,
            response TEXT,
            FOREIGN KEY(module_id) REFERENCES modules(id)
        );

        CREATE TABLE IF NOT EXISTS dependencies (
            from_module TEXT,
            to_module TEXT,
            type TEXT,
            PRIMARY KEY (from_module, to_module),
            FOREIGN KEY(from_module) REFERENCES modules(id),
            FOREIGN KEY(to_module) REFERENCES modules(id)
        );

        CREATE TABLE IF NOT EXISTS documentation (
            id TEXT PRIMARY KEY,
            path TEXT,
            title TEXT,
            checksum TEXT,
            last_generated DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS files_hash (
            path TEXT PRIMARY KEY,
            hash TEXT,
            last_update DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    return db;
}
