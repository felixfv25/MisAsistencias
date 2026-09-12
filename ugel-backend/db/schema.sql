-- schema.sql
-- Puedes crear la base de datos manualmente desde la terminal asi:
--
--   sqlite3 asistencia.db
--   sqlite> .read db/schema.sql
--   sqlite> .quit
--
-- (esto hace lo mismo que "node db/init.js", pero a mano, tal como pediste)

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

-- usuario de prueba para el login (usuario: admin09 / clave: admin123)
INSERT OR IGNORE INTO usuarios (usuario, password) VALUES ('admin09', 'admin123');

-- personas de prueba
INSERT OR IGNORE INTO personas (dni, nombres, apellidos, celular) VALUES
    ('71234567', 'JUAN CARLOS', 'PEREZ GOMEZ', '987654321'),
    ('72345678', 'MARIA ELENA', 'RAMIREZ TORRES', '987654322'),
    ('73456789', 'LUIS ALBERTO', 'FLORES VILCHEZ', '987654323');
