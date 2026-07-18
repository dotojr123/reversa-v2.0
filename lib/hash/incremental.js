import crypto from 'crypto';
import fs from 'fs';
import { getDb } from '../sqlite/db.js';

export function calculateHash(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

export function hasFileChanged(filePath, projectRoot = process.cwd()) {
    const currentHash = calculateHash(filePath);
    if (!currentHash) return false;

    const db = getDb(projectRoot);
    const row = db.prepare('SELECT hash FROM files_hash WHERE path = ?').get(filePath);

    if (!row) {
        // New file
        return true;
    }

    return row.hash !== currentHash;
}

export function updateFileHash(filePath, projectRoot = process.cwd()) {
    const currentHash = calculateHash(filePath);
    if (!currentHash) return;

    const db = getDb(projectRoot);
    
    db.prepare(`
        INSERT INTO files_hash (path, hash, last_update) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(path) DO UPDATE SET 
        hash = excluded.hash,
        last_update = excluded.last_update
    `).run(filePath, currentHash);
}
