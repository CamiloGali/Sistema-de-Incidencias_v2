const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'incidentes.json');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

fs.mkdirSync(dataDir, { recursive: true });

function leerIncidentesLegacy() {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function inicializarBaseDeDatos() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Falta la variable de entorno DATABASE_URL');
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incidentes (
      id BIGINT PRIMARY KEY,
      fecha TEXT NOT NULL,
      nombre TEXT NOT NULL,
      tipo_lugar TEXT NOT NULL,
      edificio TEXT NOT NULL DEFAULT '',
      genero TEXT NOT NULL DEFAULT '',
      piso TEXT NOT NULL DEFAULT '',
      ubicacion TEXT NOT NULL DEFAULT '',
      descripcion TEXT NOT NULL,
      evidencia TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'En curso',
      responsable TEXT NOT NULL DEFAULT 'Sin asignar',
      alerta TEXT,
      alerta_responsable TEXT,
      alerta_fecha TEXT,
      alerta_leida BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);

  const legacyIncidentes = leerIncidentesLegacy();
  if (legacyIncidentes.length) {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM incidentes');
    if (rows[0].total === 0) {
      for (const incidente of legacyIncidentes) {
        await guardarIncidente(incidente);
      }
      console.log(`Se migraron ${legacyIncidentes.length} incidentes desde el archivo JSON.`);
    }
  }
}

async function listarIncidentes() {
  const { rows } = await pool.query(`
    SELECT id, fecha, nombre, tipo_lugar AS "tipoLugar", edificio, genero, piso,
           ubicacion, descripcion, evidencia, status, responsable, alerta,
           alerta_responsable AS "alertaResponsable", alerta_fecha AS "alertaFecha",
           alerta_leida AS "alertaLeida"
    FROM incidentes
    ORDER BY id ASC
  `);
  return rows;
}

async function guardarIncidente(incidente) {
  await pool.query(`
    INSERT INTO incidentes (
      id, fecha, nombre, tipo_lugar, edificio, genero, piso, ubicacion,
      descripcion, evidencia, status, responsable, alerta, alerta_responsable,
      alerta_fecha, alerta_leida
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    ON CONFLICT (id) DO NOTHING
  `, [
    incidente.id,
    incidente.fecha,
    incidente.nombre,
    incidente.tipoLugar,
    incidente.edificio || '',
    incidente.genero || '',
    incidente.piso || '',
    incidente.ubicacion || '',
    incidente.descripcion,
    incidente.evidencia || '',
    incidente.status || 'En curso',
    incidente.responsable || 'Sin asignar',
    incidente.alerta || null,
    incidente.alertaResponsable || null,
    incidente.alertaFecha || null,
    Boolean(incidente.alertaLeida)
  ]);
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use(express.static(__dirname));

app.get('/api/incidentes', async (req, res) => {
  try {
    res.json(await listarIncidentes());
  } catch (error) {
    console.error('Error al consultar incidentes:', error.message);
    res.status(500).json({ error: 'No se pudieron consultar los incidentes' });
  }
});

app.post('/api/incidentes', async (req, res) => {
  const {
    fecha,
    nombre,
    tipoLugar,
    edificio,
    genero,
    piso,
    ubicacion,
    descripcion,
    evidencia,
    status,
    responsable
  } = req.body;

  if (!fecha || !nombre || !tipoLugar || !descripcion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const nuevoIncidente = {
    id: Date.now(),
    fecha,
    nombre,
    tipoLugar,
    edificio: edificio || '',
    genero: genero || '',
    piso: piso || '',
    ubicacion: ubicacion || '',
    descripcion,
    evidencia: evidencia || '',
    status: status || 'En curso',
    responsable: responsable || 'Sin asignar'
  };

  try {
    await guardarIncidente(nuevoIncidente);
    res.status(201).json({ id: nuevoIncidente.id, message: 'Incidente guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar incidente:', error.message);
    res.status(500).json({ error: 'No se pudo guardar el incidente' });
  }
});

app.patch('/api/incidentes/:id', async (req, res) => {
  const { id } = req.params;
  const allowedFields = {
    fecha: 'fecha', nombre: 'nombre', tipoLugar: 'tipo_lugar', edificio: 'edificio',
    genero: 'genero', piso: 'piso', ubicacion: 'ubicacion', descripcion: 'descripcion',
    evidencia: 'evidencia', status: 'status', responsable: 'responsable', alerta: 'alerta',
    alertaResponsable: 'alerta_responsable', alertaFecha: 'alerta_fecha', alertaLeida: 'alerta_leida'
  };
  const updates = Object.entries(req.body)
    .filter(([field]) => allowedFields[field])
    .map(([field, value]) => [allowedFields[field], value]);

  if (!updates.length) {
    return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
  }

  try {
    const setClause = updates.map(([field], index) => `"${field}" = $${index + 2}`).join(', ');
    const values = [id, ...updates.map(([, value]) => value)];
    const result = await pool.query(
      `UPDATE incidentes SET ${setClause} WHERE id = $1`,
      values
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Incidente no encontrado' });
    }

    res.json({ message: 'Incidente actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar incidente:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar el incidente' });
  }
});

inicializarBaseDeDatos()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('No se pudo inicializar PostgreSQL:', error.message);
    process.exit(1);
  });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'incidentes.json');

fs.mkdirSync(dataDir, { recursive: true });

function leerIncidentes() {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function guardarIncidentes(lista) {
  fs.writeFileSync(dataFile, JSON.stringify(lista, null, 2), 'utf8');
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use(express.static(__dirname));

app.get('/api/incidentes', (req, res) => {
  const incidentes = leerIncidentes();
  res.json(incidentes);
});

app.post('/api/incidentes', (req, res) => {
  const {
    fecha,
    nombre,
    tipoLugar,
    edificio,
    genero,
    piso,
    ubicacion,
    descripcion,
    evidencia,
    status,
    responsable
  } = req.body;

  if (!fecha || !nombre || !tipoLugar || !descripcion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const incidentes = leerIncidentes();
  const nuevoIncidente = {
    id: Date.now(),
    fecha,
    nombre,
    tipoLugar,
    edificio: edificio || '',
    genero: genero || '',
    piso: piso || '',
    ubicacion: ubicacion || '',
    descripcion,
    evidencia: evidencia || '',
    status: status || 'En curso',
    responsable: responsable || 'Sin asignar'
  };

  incidentes.push(nuevoIncidente);
  guardarIncidentes(incidentes);

  res.status(201).json({ id: nuevoIncidente.id, message: 'Incidente guardado correctamente' });
});

app.patch('/api/incidentes/:id', (req, res) => {
  const { id } = req.params;
  const incidentes = leerIncidentes();
  const index = incidentes.findIndex(item => String(item.id) === String(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Incidente no encontrado' });
  }

  incidentes[index] = {
    ...incidentes[index],
    ...req.body
  };

  guardarIncidentes(incidentes);
  res.json({ message: 'Incidente actualizado correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
