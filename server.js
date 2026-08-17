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
