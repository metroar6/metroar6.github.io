// Backend Node.js con SQLite para guardar usuarios (gmail y contraseña)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Crear o abrir la base de datos SQLite en la carpeta actual
const dbPath = path.join(__dirname, 'usuarios.db');
const db = new sqlite3.Database(dbPath);

// Crear tabla si no existe
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            gmail TEXT PRIMARY KEY,
            password TEXT NOT NULL
        )
    `);
});

app.use(cors());
app.use(bodyParser.json());

// Registro de usuario
app.post('/api/registro', (req, res) => {
    const { gmail, password } = req.body;
    if (!gmail || !password) {
        return res.status(400).json({ error: 'Faltan datos' });
    }
    db.get('SELECT gmail FROM usuarios WHERE gmail = ?', [gmail], (err, row) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos' });
        if (row) return res.status(400).json({ error: 'El usuario ya existe' });
        db.run('INSERT INTO usuarios (gmail, password) VALUES (?, ?)', [gmail, password], function(err) {
            if (err) return res.status(500).json({ error: 'Error al registrar usuario' });
            res.json({ success: true, message: 'Usuario registrado', gmail });
        });
    });
});

// Login de usuario
app.post('/api/login', (req, res) => {
    const { gmail, password } = req.body;
    db.get('SELECT gmail FROM usuarios WHERE gmail = ? AND password = ?', [gmail, password], (err, row) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos' });
        if (row) {
            res.json({ success: true });
        } else {
            res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
    console.log('Base de datos SQLite en:', dbPath);
});