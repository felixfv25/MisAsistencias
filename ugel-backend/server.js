// server.js
// Backend de UGEL 09 - Control de Asistencia
// Reemplaza la conexion a Turso por SQLite local (archivo asistencia.db).
//
// Endpoints (coinciden EXACTO con ApiService.java de la app Android):
//   POST  /api/auth/login
//   GET   /api/registros/hoy
//   GET   /api/personas/:dni      (requiere Authorization: Bearer <token>)
//   PATCH /api/registros/:id/salida

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db/connection');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Tokens validos en memoria (simple, sin JWT).
// Se pierden si el servidor se reinicia -> el usuario tendria que
// volver a loguearse. Es suficiente para un proyecto de practicas.
const tokensValidos = new Set();

function horaActual() {
    return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function fechaActual() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// ---------------------------------------------------------------
// POST /api/auth/login
// body: { usuario, password }
// respuesta: { ok, token, usuario }
// ---------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
    const { usuario, password } = req.body || {};

    if (!usuario || !password) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan usuario o password' });
    }

    const fila = db.prepare('SELECT * FROM usuarios WHERE usuario = ? AND password = ?')
                    .get(usuario, password);

    if (!fila) {
        return res.status(401).json({ ok: false, mensaje: 'Usuario o contraseña incorrectos' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    tokensValidos.add(token);

    return res.json({ ok: true, token, usuario: fila.usuario });
});

// Middleware para proteger /personas/:dni con el token del login
function requiereToken(req, res, next) {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token || !tokensValidos.has(token)) {
        return res.status(401).json({ ok: false, mensaje: 'Token invalido o ausente' });
    }
    next();
}

// ---------------------------------------------------------------
// GET /api/registros/hoy   (publico, sin token)
// respuesta: { fecha, registros: [...] }
// ---------------------------------------------------------------
app.get('/api/registros/hoy', (req, res) => {
    const hoy = fechaActual();

    const registros = db.prepare(`
        SELECT r.id, r.dni, r.fecha, r.hora_ingreso, r.hora_salida,
               r.area, r.asunto,
               p.nombres, p.apellidos, p.celular
        FROM registros r
        JOIN personas p ON p.dni = r.dni
        WHERE r.fecha = ?
        ORDER BY r.hora_ingreso DESC
    `).all(hoy);

    res.json({ fecha: hoy, registros });
});

// ---------------------------------------------------------------
// GET /api/personas/:dni   (requiere token)
// respuesta si existe:    { encontrada: true, persona: {...} }
// respuesta si no existe: 404 { encontrada: false }
// ---------------------------------------------------------------
app.get('/api/personas/:dni', requiereToken, (req, res) => {
    const { dni } = req.params;

    const persona = db.prepare('SELECT * FROM personas WHERE dni = ?').get(dni);

    if (!persona) {
        return res.status(404).json({ encontrada: false });
    }

    return res.json({ encontrada: true, persona });
});

// ---------------------------------------------------------------
// PATCH /api/registros/:id/salida   (publico, sin token)
// respuesta: { ok, id, hora_salida }
// ---------------------------------------------------------------
app.patch('/api/registros/:id/salida', (req, res) => {
    const { id } = req.params;

    const registro = db.prepare('SELECT * FROM registros WHERE id = ?').get(id);
    if (!registro) {
        return res.status(404).json({ ok: false, mensaje: 'Registro no encontrado' });
    }

    const hora = horaActual();
    db.prepare('UPDATE registros SET hora_salida = ? WHERE id = ?').run(hora, id);

    return res.json({ ok: true, id: Number(id), hora_salida: hora });
});

// ---------------------------------------------------------------
app.get('/', (req, res) => {
    res.json({ mensaje: 'API UGEL 09 - Control de Asistencia (SQLite)', ok: true });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Base de datos: asistencia.db (SQLite local)`);
});
