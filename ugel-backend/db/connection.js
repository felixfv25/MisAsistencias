// db/connection.js
// Conexion compartida a la base de datos SQLite local (reemplaza a Turso).

const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'asistencia.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

module.exports = db;
