const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Set up SQLite database
const db = new sqlite3.Database('database.db'); // Change to file-based database

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS organizations (id INTEGER PRIMARY KEY, name TEXT, email TEXT, location TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS teams (id INTEGER PRIMARY KEY, name TEXT, organization_id INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY, name TEXT, team_id INTEGER, image TEXT)");
});

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/register-organization', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register-organization.html'));
});

app.get('/add-team', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'add-team.html'));
});

app.get('/add-member', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'add-member.html'));
});

app.post('/register-organization', (req, res) => {
    const { name, email, location } = req.body;
    console.log('Received request to register organization:', req.body);
    db.run("INSERT INTO organizations (name, email, location) VALUES (?, ?, ?)", [name, email, location], function(err) {
        if (err) {
            console.error('Error registering organization:', err);
            return res.json({ success: false, message: err.message });
        }
        console.log('Organization registered successfully:', { id: this.lastID });
        res.json({ success: true, id: this.lastID });
    });
});

app.get('/organizations', (req, res) => {
    db.all("SELECT * FROM organizations", [], (err, orgs) => {
        if (err) {
            console.error('Error fetching organizations:', err);
            return res.json({ success: false, message: err.message });
        }
        console.log('Fetched organizations:', orgs);
        db.all("SELECT * FROM teams", [], (err, teams) => {
            if (err) {
                console.error('Error fetching teams:', err);
                return res.json({ success: false, message: err.message });
            }
            console.log('Fetched teams:', teams);
            res.json({ success: true, organizations: orgs, teams: teams });
        });
    });
});

app.post('/add-team', (req, res) => {
    const { name, organization_id } = req.body;
    console.log('Received request to add team:', req.body);
    db.run("INSERT INTO teams (name, organization_id) VALUES (?, ?)", [name, organization_id], function(err) {
        if (err) {
            console.error('Error adding team:', err);
            return res.json({ success: false, message: err.message });
        }
        console.log('Team added successfully:', { id: this.lastID });
        res.json({ success: true, id: this.lastID });
    });
});

app.post('/add-member', upload.single('image'), (req, res) => {
    const { name, team_id } = req.body;
    const image = req.file ? req.file.filename : null;

    console.log('Received request to add member:', req.body);
    db.get("SELECT * FROM teams WHERE id = ?", [team_id], (err, team) => {
        if (err) {
            console.error('Error fetching team:', err);
            return res.json({ success: false, message: err.message });
        }
        if (!team) {
            console.error('Invalid team ID:', team_id);
            return res.json({ success: false, message: 'Invalid team ID' });
        }

        console.log('Team found:', team);

        db.run("INSERT INTO members (name, team_id, image) VALUES (?, ?, ?)", [name, team_id, image], function(err) {
            if (err) {
                console.error('Error inserting member:', err);
                return res.json({ success: false, message: err.message });
            }
            console.log('Member added successfully:', { id: this.lastID });
            res.json({ success: true, id: this.lastID });
        });
    });
});

app.get('/members', (req, res) => {
    db.all("SELECT * FROM members", [], (err, rows) => {
        if (err) {
            console.error('Error fetching members:', err);
            return res.json({ success: false, message: err.message });
        }
        console.log('Fetched members:', rows);
        res.json({ success: true, members: rows });
    });
});

app.get('/teams', (req, res) => {
    db.all("SELECT * FROM teams", [], (err, teams) => {
        if (err) {
            console.error('Error fetching teams:', err);
            return res.json({ success: false, message: err.message });
        }
        console.log('Fetched teams:', teams);
        res.json({ success: true, teams: teams });
    });
});

app.get('/api/members', (req, res) => {
    db.all("SELECT * FROM members", [], (err, rows) => {
        if (err) {
            console.error('Error fetching members:', err);
            return res.json({ success: false, message: err.message });
        }
        console.log('Fetched members:', rows);
        res.json({ success: true, members: rows });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});