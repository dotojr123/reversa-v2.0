import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import path from 'path';

export class SQLiteStorage {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
    }

    async init() {
        if (this.dbPath !== ':memory:') {
            await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
        }
        
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) reject(err);
                else {
                    this.db.serialize(() => {
                        this.db.run(`
                            CREATE TABLE IF NOT EXISTS knowledge_commits (
                                id TEXT PRIMARY KEY,
                                parent TEXT,
                                timestamp INTEGER,
                                author TEXT,
                                reason TEXT,
                                changeset TEXT,
                                graphChanges TEXT,
                                knowledgeHash TEXT,
                                schemaVersion TEXT
                            )
                        `);
                        
                        this.db.run(`
                            CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(canonicalId, type, content)
                        `, (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }
            });
        });
    }

    async execute(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }

    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async close() {
        return new Promise((resolve, reject) => {
            if (!this.db) return resolve();
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}
