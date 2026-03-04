require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_hydrosecure';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ---------------------------------------------------------
// Middleware
// ---------------------------------------------------------
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient role' });
        }
        next();
    };
};

// ---------------------------------------------------------
// Auth Routes
// ---------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// ---------------------------------------------------------
// Sites Routes
// ---------------------------------------------------------
app.get('/api/sites', authenticateToken, (req, res) => {
    const sites = db.prepare('SELECT * FROM sites').all();
    res.json(sites);
});

// ---------------------------------------------------------
// Readings Routes
// ---------------------------------------------------------
app.post('/api/readings', authenticateToken, requireRole(['FIELD', 'SUPERVISOR']), upload.single('photo'), (req, res) => {
    try {
        const { site_id, water_level, lat, lng, timestamp, is_tampered, notes } = req.body;
        const photo_path = req.file ? `/uploads/${req.file.filename}` : null;

        // Basic tamper detection override check
        let tamperedFlag = is_tampered === 'true' || is_tampered === true ? 1 : 0;

        // Verify Geofence visually on the server as well?
        const site = db.prepare('SELECT lat, lng, allowed_radius_meters FROM sites WHERE id = ?').get(site_id);
        if (site && lat && lng) {
            // Haversine formula
            const R = 6371e3; // metres
            const φ1 = site.lat * Math.PI / 180;
            const φ2 = parseFloat(lat) * Math.PI / 180;
            const Δφ = (parseFloat(lat) - site.lat) * Math.PI / 180;
            const Δλ = (parseFloat(lng) - site.lng) * Math.PI / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c;

            if (d > site.allowed_radius_meters) {
                tamperedFlag = 1; // Mark as tampered if it's outside the geofence on server side
            }
        }

        const stmt = db.prepare(`
            INSERT INTO readings (site_id, user_id, water_level, lat, lng, timestamp, photo_path, is_tampered, synced_at, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        `);

        const result = stmt.run(
            site_id,
            req.user.id,
            water_level,
            lat,
            lng,
            timestamp || new Date().toISOString(),
            photo_path,
            tamperedFlag,
            notes || null
        );

        res.status(201).json({ success: true, readingId: result.lastInsertRowid });
    } catch (err) {
        console.error("Reading Submission Error:", err);
        res.status(500).json({ error: 'Server error saving reading' });
    }
});

// Supervisor/Admin get all readings
app.get('/api/readings', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN']), (req, res) => {
    const { site_id } = req.query;
    let query = `
        SELECT r.*, s.name as site_name, u.username as user_name 
        FROM readings r 
        JOIN sites s ON r.site_id = s.id 
        LEFT JOIN users u ON r.user_id = u.id 
        ORDER BY r.timestamp DESC
    `;
    let readings;

    if (site_id) {
        query = `
            SELECT r.*, s.name as site_name, u.username as user_name 
            FROM readings r 
            JOIN sites s ON r.site_id = s.id 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.site_id = ?
            ORDER BY r.timestamp DESC
        `;
        readings = db.prepare(query).all(site_id);
    } else {
        readings = db.prepare(query).all();
    }

    res.json(readings);
});

// Public Portal - Create Reading without Auth (just site_id, photo, etc)
app.get('/api/public/sites', (req, res) => {
    try {
        const sites = db.prepare('SELECT id, name, lat, lng, allowed_radius_meters FROM sites').all();
        res.json(sites);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching public sites' });
    }
});

app.get('/api/public/readings', (req, res) => {
    try {
        const readings = db.prepare(`
            SELECT r.id, r.site_id, r.water_level, r.timestamp, r.photo_path, s.name as site_name
            FROM readings r 
            JOIN sites s ON r.site_id = s.id 
            ORDER BY r.timestamp DESC
            LIMIT 100
        `).all();
        res.json(readings);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching public readings' });
    }
});

// Public Portal - Create Reading without Auth (just site_id, photo, etc)
app.post('/api/public/readings', upload.single('photo'), (req, res) => {
    try {
        const { site_id, water_level, lat, lng, timestamp, notes } = req.body;
        const photo_path = req.file ? `/uploads/${req.file.filename}` : null;

        // Public requires photo
        if (!photo_path) {
            return res.status(400).json({ error: 'Photo is required for public submissions.' });
        }

        const stmt = db.prepare(`
            INSERT INTO readings (site_id, user_id, water_level, lat, lng, timestamp, photo_path, is_tampered, synced_at, notes)
            VALUES (?, NULL, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, ?)
        `);

        const result = stmt.run(
            site_id,
            water_level,
            lat,
            lng,
            timestamp || new Date().toISOString(),
            photo_path,
            notes || 'Public Submission'
        );
        res.status(201).json({ success: true, readingId: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: 'Server error saving reading' });
    }
});

// ---------------------------------------------------------
// Gauge Meter Image Analysis (AI Vision)
// ---------------------------------------------------------
app.post('/api/analyze-gauge', authenticateToken, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (GEMINI_API_KEY) {
            // --- Real Gemini Vision API call ---
            const fs = require('fs');
            const https = require('https');

            const imageBuffer = fs.readFileSync(req.file.path);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = req.file.mimetype || 'image/jpeg';

            const payload = JSON.stringify({
                contents: [{
                    parts: [
                        {
                            text: `You are a water gauge meter reading expert. Look at this image of a water level gauge meter from a dam or water body.
                            
Your task: Extract the water level reading shown on the gauge.

Instructions:
- If it is an ANALOG gauge (needle/pointer), read the value the needle is pointing to.
- If it is a DIGITAL display, read the number shown.
- If it is a STAFF GAUGE (ruler in water), read where the water surface meets the scale.
- Return ONLY a single number in centimeters (cm). Convert if needed.
- If you cannot read the gauge clearly, return exactly: UNREADABLE

Respond with ONLY the numeric value (e.g. "245") or "UNREADABLE". No units, no explanation.`
                        },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Image
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 50
                }
            });

            const result = await new Promise((resolve, reject) => {
                const options = {
                    hostname: 'generativelanguage.googleapis.com',
                    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(payload)
                    }
                };

                const request = https.request(options, (response) => {
                    let data = '';
                    response.on('data', chunk => data += chunk);
                    response.on('end', () => resolve(JSON.parse(data)));
                });
                request.on('error', reject);
                request.write(payload);
                request.end();
            });

            const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'UNREADABLE';

            if (rawText === 'UNREADABLE') {
                return res.json({ success: false, message: 'Could not read gauge clearly. Please enter manually.' });
            }

            const value = parseFloat(rawText.replace(/[^0-9.]/g, ''));
            if (isNaN(value)) {
                return res.json({ success: false, message: 'Could not parse gauge value. Please enter manually.' });
            }

            return res.json({ success: true, water_level: value.toFixed(1), method: 'gemini_vision', confidence: 'high' });

        } else {
            // --- Demo/Simulation Mode (no API key) ---
            // Simulates realistic readings for testing purposes
            await new Promise(resolve => setTimeout(resolve, 1800)); // Simulate processing time

            const demoReadings = [142.5, 215.0, 89.3, 307.8, 176.2, 423.1, 58.9, 265.0];
            const simulatedValue = demoReadings[Math.floor(Math.random() * demoReadings.length)];

            return res.json({
                success: true,
                water_level: simulatedValue.toFixed(1),
                method: 'demo_simulation',
                confidence: 'demo',
                note: 'Demo mode — add GEMINI_API_KEY to backend/.env for real AI gauge reading'
            });
        }
    } catch (err) {
        console.error('Gauge analysis error:', err);
        res.status(500).json({ error: 'Analysis failed. Please enter water level manually.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

