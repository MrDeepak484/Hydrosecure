const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'hydrosecure.db');
const uploadsDir = path.resolve(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

const initDb = () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'FIELD' -- FIELD, SUPERVISOR, ADMIN, PUBLIC
        );

        CREATE TABLE IF NOT EXISTS sites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            allowed_radius_meters REAL NOT NULL,
            qr_code_value TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site_id INTEGER NOT NULL,
            user_id INTEGER,
            water_level REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            lat REAL,
            lng REAL,
            photo_path TEXT,
            is_tampered BOOLEAN DEFAULT 0,
            synced_at DATETIME,
            notes TEXT,
            FOREIGN KEY(site_id) REFERENCES sites(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    // Seed default admin and sample data if empty
    const adminCount = db.prepare('SELECT count(*) as count FROM users WHERE role = ?').get('ADMIN');
    if (adminCount.count === 0) {
        const hash = bcrypt.hashSync('admin123', 10);
        db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hash, 'ADMIN');

        const supervisorHash = bcrypt.hashSync('super123', 10);
        db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('supervisor1', supervisorHash, 'SUPERVISOR');

        const fieldHash = bcrypt.hashSync('field123', 10);
        db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('field1', fieldHash, 'FIELD');

        console.log('Default users created.');
    }

    const sitesCount = db.prepare('SELECT count(*) as count FROM sites').get();
    if (sitesCount.count === 0) {
        const insertSite = db.prepare(`INSERT INTO sites (name, lat, lng, allowed_radius_meters, qr_code_value) VALUES (?, ?, ?, ?, ?)`);

        insertSite.run('Site Alpha (Test)', 12.9716, 77.5946, 500, 'SITE_ALPHA_QR_123'); // Bangalore coords
        insertSite.run('Mettur Dam (Salem, TN)', 11.8000, 77.8000, 2000, 'METTUR_DAM_QR');
        insertSite.run('Vaigai Dam (Theni, TN)', 10.0538, 77.5872, 1500, 'VAIGAI_DAM_QR');
        insertSite.run('Bhavanisagar Dam (Erode, TN)', 11.4740, 77.1265, 2000, 'BHAVANISAGAR_DAM_QR');
        insertSite.run('Papanasam Dam (Tirunelveli, TN)', 8.6826, 77.3021, 1500, 'PAPANASAM_DAM_QR');
        insertSite.run('Kallanai Dam (Thanjavur, TN)', 10.8290, 78.8256, 1000, 'KALLANAI_DAM_QR');

        console.log('Tamil Nadu dams and sites created.');
    }
};

initDb();

module.exports = db;
