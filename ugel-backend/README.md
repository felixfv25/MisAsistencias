# UGEL 09 - Backend de Asistencia (SQLite local)

Este backend reemplaza la conexión a Turso por una base de datos **SQLite local**
(un solo archivo `asistencia.db`). Implementa los mismos 4 endpoints que ya
usa tu app Android, así que **no necesitas cambiar nada en `ApiService.java`**,
solo el `BASE_URL` en `RetrofitClient.java` cuando lo subas a Render.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Crear la base de datos

Tienes 2 formas, hacen exactamente lo mismo:

**Opción A - con Node (recomendada, ya trae datos de prueba):**
```bash
node db/init.js
```

**Opción B - a mano con el comando sqlite3 (como pediste, "tipo cmd"):**
```bash
sqlite3 asistencia.db
sqlite> .read db/schema.sql
sqlite> .tables
sqlite> .quit
```

Cualquiera de las dos crea el archivo `asistencia.db` con 3 tablas:
`usuarios`, `personas`, `registros`, y datos de prueba:
- Usuario para el login: **admin09 / admin123**
- 3 personas de ejemplo (DNIs 71234567, 72345678, 73456789)
- 2 registros de asistencia de "hoy"

## 3. Correr el servidor

```bash
node server.js
```

Debería mostrar:
```
Servidor escuchando en http://localhost:3000
Base de datos: asistencia.db (SQLite local)
```

## 4. Probar los endpoints (con curl, o Postman)

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin09","password":"admin123"}'

# Registros de hoy (público)
curl http://localhost:3000/api/registros/hoy

# Buscar persona (necesita el token del login)
curl http://localhost:3000/api/personas/71234567 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Marcar salida de un registro
curl -X PATCH http://localhost:3000/api/registros/1/salida
```

## 5. Ver la base de datos directamente (opcional)

```bash
sqlite3 asistencia.db
sqlite> SELECT * FROM personas;
sqlite> SELECT * FROM registros;
sqlite> .quit
```

## 6. Conectar tu app Android

En `RetrofitClient.java`, cambia el `BASE_URL`:

- **Emulador + backend en tu misma PC**: `http://10.0.2.2:3000/api/`
- **Celular físico + backend en tu PC (misma WiFi)**: `http://TU_IP_LOCAL:3000/api/`
- **Backend subido a Render**: `https://tu-proyecto.onrender.com/api/`

## 7. Subir a Render

1. Sube esta carpeta a un repo de GitHub.
2. En Render, crea un "Web Service" apuntando a ese repo.
3. Build command: `npm install`
4. Start command: `node server.js`

⚠️ Importante: en el plan gratis de Render, el disco se reinicia en cada
deploy. Esto significa que **el archivo `asistencia.db` se pierde cada vez
que Render reinicia el servicio** (por inactividad o un nuevo deploy), a
menos que agregues un "Persistent Disk" (de pago) o corras `node db/init.js`
como parte del build para que siempre exista con los datos base. Para un
proyecto de prácticas esto normalmente no es un problema, pero es bueno que
lo sepas.

## Próximo paso (cuando quieras)

Agregar la verificación con una API externa gratis (ApiPeruDev o
PeruAPI.dev) para cuando alguien busque un DNI que NO esté en tu tabla
`personas` — así el sistema no depende 100% de que hayas cargado a la
persona a mano de antes.
