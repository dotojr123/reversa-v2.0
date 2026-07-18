import sqlite3 from 'sqlite3';
import { QueueProvider } from '../../core/interfaces/QueueProvider.js';

export class SQLiteQueueProvider extends QueueProvider {
    constructor(dbPath = '.reversa/queue.db') {
        super();
        this.dbPath = dbPath;
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) return reject(err);
                
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS knowledge_queue_jobs (
                        id TEXT PRIMARY KEY,
                        type TEXT,
                        payload TEXT,
                        status TEXT,
                        created_at TEXT,
                        error TEXT,
                        retries INTEGER DEFAULT 0
                    )
                `, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    async enqueue(job) {
        return new Promise((resolve, reject) => {
            const id = crypto.randomUUID();
            const now = new Date().toISOString();
            const stmt = this.db.prepare('INSERT INTO knowledge_queue_jobs (id, type, payload, status, created_at) VALUES (?, ?, ?, ?, ?)');
            stmt.run(id, job.type, JSON.stringify(job.payload), 'PENDING', now, (err) => {
                if (err) reject(err);
                else resolve(id);
            });
            stmt.finalize();
        });
    }

    async dequeue() {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM knowledge_queue_jobs WHERE status = ? ORDER BY created_at ASC LIMIT 1', ['PENDING'], (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve(null);
                
                this.db.run('UPDATE knowledge_queue_jobs SET status = ? WHERE id = ?', ['PROCESSING', row.id], (err) => {
                    if (err) return reject(err);
                    resolve({
                        id: row.id,
                        type: row.type,
                        payload: JSON.parse(row.payload)
                    });
                });
            });
        });
    }

    async ack(jobId) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE knowledge_queue_jobs SET status = ? WHERE id = ?', ['COMPLETED', jobId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async retry(jobId, error) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE knowledge_queue_jobs SET status = ?, error = ?, retries = retries + 1 WHERE id = ?', ['FAILED', String(error), jobId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async size() {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT COUNT(*) as count FROM knowledge_queue_jobs WHERE status = ?', ['PENDING'], (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
    }
}
