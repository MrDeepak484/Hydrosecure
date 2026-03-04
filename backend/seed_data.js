const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'hydrosecure.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('Seeding comprehensive dummy data for National Water Grid demonstration...');

// Get all sites and field users
const sites = db.prepare('SELECT id, name FROM sites').all();
const fieldUsers = db.prepare('SELECT id FROM users WHERE role = ?').all('FIELD');

if (sites.length === 0 || fieldUsers.length === 0) {
    console.error('Database needs sites and at least one Field user. Please restart the backend to initialize the database first.');
    process.exit(1);
}

const insertReading = db.prepare(`
    INSERT INTO readings (site_id, user_id, water_level, timestamp, is_tampered)
    VALUES (?, ?, ?, ?, ?)
`);

// Delete existing readings to start fresh
db.prepare('DELETE FROM readings').run();
console.log('Cleared existing telemetry data.');

// Generate realistic data over the past 7 days
const now = new Date();
const records = [];

sites.forEach(site => {
    // Base level for the site
    let currentLevel = 150 + Math.random() * 100; // Between 150 and 250

    // Create ~50 readings per site over 7 days
    for (let i = 50; i >= 0; i--) {
        const readingDate = new Date(now.getTime() - (i * 3.5 * 60 * 60 * 1000) - (Math.random() * 3600000)); // Every ~3.5 hours

        // Randomly fluctuate level (simulating rainfall / evaporation)
        const fluctuation = (Math.random() - 0.45) * 12;
        currentLevel = Math.max(80, Math.min(350, currentLevel + fluctuation));

        let isTampered = 0;
        let finalLevel = currentLevel;

        // Sometimes simulate a massive spike / critical alert (>300)
        if (Math.random() > 0.96) {
            finalLevel += 60; // Flood warning
        }

        // Simulate hardware tampering
        if (Math.random() > 0.98) {
            isTampered = 1;
        }

        const userId = fieldUsers[Math.floor(Math.random() * fieldUsers.length)].id;

        records.push({
            siteId: site.id,
            userId: userId,
            level: finalLevel.toFixed(1),
            time: readingDate.toISOString().replace('T', ' ').slice(0, 19), // SQLite friendly DATETIME
            tampered: isTampered
        });
    }
});

// Use a transaction for fast bulk inserts
const insertMany = db.transaction((readings) => {
    for (const r of readings) {
        insertReading.run(r.siteId, r.userId, r.level, r.time, r.tampered);
    }
});

insertMany(records);

console.log(`✅ Successfully seeded ${records.length} highly realistic telemetry readings across ${sites.length} sites!`);
