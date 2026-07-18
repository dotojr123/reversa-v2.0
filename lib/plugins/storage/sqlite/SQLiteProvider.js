import sqlite3 from 'sqlite3';
import { StorageProvider } from '../../../core/interfaces/StorageProvider.js';

export class SQLiteProvider extends StorageProvider {
    constructor() {
        super();
        this.db = null;
    }

    async connect(config) {
        return new Promise((resolve, reject) => {
            const dbPath = config.dbPath || ':memory:';
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) return reject(err);
                
                // Initialize basic tables
                this.db.serialize(() => {
                    this.db.run(`
                        CREATE TABLE IF NOT EXISTS metadata (
                            key TEXT PRIMARY KEY,
                            value TEXT
                        )
                    `);
                    this.db.run(`
                        INSERT OR IGNORE INTO metadata (key, value) VALUES ('schema_version', '1.0')
                    `);
                    this.db.run(`
                        CREATE TABLE IF NOT EXISTS knowledge_objects (
                            id TEXT PRIMARY KEY,
                            type TEXT,
                            content TEXT,
                            source TEXT,
                            confidence INTEGER,
                            created_at DATETIME,
                            updated_at DATETIME
                        )
                    `);
                });
                resolve();
            });
        });
    }

    async disconnect() {
        return new Promise((resolve, reject) => {
            if (!this.db) return resolve();
            this.db.close((err) => {
                if (err) return reject(err);
                this.db = null;
                resolve();
            });
        });
    }

    async saveObject(knowledgeObject) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO knowledge_objects (id, type, content, source, confidence, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    content=excluded.content,
                    source=excluded.source,
                    confidence=excluded.confidence,
                    updated_at=excluded.updated_at
            `);
            
            stmt.run([
                knowledgeObject.id,
                knowledgeObject.type,
                JSON.stringify(knowledgeObject.content),
                knowledgeObject.source,
                knowledgeObject.confidence,
                knowledgeObject.createdAt,
                knowledgeObject.updatedAt
            ], function(err) {
                if (err) reject(err);
                else resolve();
            });
            stmt.finalize();
        });
    }

    async getObject(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM knowledge_objects WHERE id = ?`, [id], (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve(null);
                
                resolve({
                    id: row.id,
                    type: row.type,
                    content: JSON.parse(row.content),
                    source: row.source,
                    confidence: row.confidence,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at
                });
            });
        });
    }

    async deleteObject(id) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM knowledge_objects WHERE id = ?`, [id], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}
