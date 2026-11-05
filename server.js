const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para leer datos enviados desde formularios HTML
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Configuración y conexión a la Base de Datos SQLite
const dbFile = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        
        // Crear tabla de usuarios si no existe e insertar el usuario inicial
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`, (err) => {
            if (!err) {
                // Verificar si ya existe el usuario temp
                db.get(`SELECT * FROM users WHERE username = ?`, ['temp'], (err, row) => {
                    if (!row) {
                        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, ['temp', '1234'], (err) => {
                            if (!err) {
                                console.log('Usuario inicial "temp" creado con éxito (contraseña: 1234).');
                            }
                        });
                    }
                });
            }
        });
    }
});

// Ruta para procesar el inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(query, [username, password], (err, row) => {
        if (err) {
            return res.status(500).send('Error interno del servidor.');
        }
        if (row) {
            // Inicio de sesión exitoso -> Redirigir al panel de bienvenida
            res.redirect('/dashboard.html');
        } else {
            // Credenciales incorrectas
            res.send(`<script>alert('Usuario o contraseña incorrectos'); window.location.href='/';</script>`);
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});