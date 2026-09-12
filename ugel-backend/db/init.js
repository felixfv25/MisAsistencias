// db/init.js
// Este script crea el archivo asistencia.db (SQLite local) con las tablas
// necesarias y datos de prueba. Se puede correr de dos formas:
//
//   1) node db/init.js          -> lo crea usando better-sqlite3 (Node)
//   2) sqlite3 asistencia.db    -> abrir sqlite3 desde la terminal y pegar
//      el contenido de schema.sql a mano (por si quieres verlo/crearlo
//      manualmente, como pediste, "tipo como en el cmd")
//
// Ambas formas crean EXACTAMENTE el mismo archivo .db.

const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'asistencia.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS usuarios (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario  TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS personas (
    dni       TEXT PRIMARY KEY,
    nombres   TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    celular   TEXT
);

CREATE TABLE IF NOT EXISTS registros (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    dni          TEXT NOT NULL,
    fecha        TEXT NOT NULL,
    hora_ingreso TEXT NOT NULL,
    hora_salida  TEXT,
    area         TEXT,
    asunto       TEXT,
    FOREIGN KEY (dni) REFERENCES personas (dni)
);
`);

// --- datos de prueba (solo se insertan si las tablas estan vacias) ---

const numUsuarios = db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n;
if (numUsuarios === 0) {
    db.prepare('INSERT INTO usuarios (usuario, password) VALUES (?, ?)')
      .run('admin09', 'admin123'); // cambia esta clave luego
    console.log('Usuario de prueba creado: admin09 / admin123');
}

const numPersonas = db.prepare('SELECT COUNT(*) AS n FROM personas').get().n;
if (numPersonas === 0) {
    const insertPersona = db.prepare(
        'INSERT INTO personas (dni, nombres, apellidos, celular) VALUES (?, ?, ?, ?)'
    );
    insertPersona.run('71234567', 'JUAN CARLOS', 'PEREZ GOMEZ', '987654321');
    insertPersona.run('72345678', 'MARIA ELENA', 'RAMIREZ TORRES', '987654322');
    insertPersona.run('73456789', 'LUIS ALBERTO', 'FLORES VILCHEZ', '987654323');
    console.log('3 personas de prueba creadas.');
}

const numRegistros = db.prepare('SELECT COUNT(*) AS n FROM registros').get().n;
if (numRegistros === 0) {
    const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const insertRegistro = db.prepare(`
        INSERT INTO registros (dni, fecha, hora_ingreso, hora_salida, area, asunto)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertRegistro.run('71234567', hoy, '08:15', null, 'Dirección', 'Reunión de coordinación');
    insertRegistro.run('72345678', hoy, '09:00', '11:30', 'Secretaría', 'Entrega de documentos');
    console.log('2 registros de prueba creados para hoy.');
}

console.log('Base de datos lista en:', DB_PATH);
db.close();
