import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DB_FILE = './usuarios.json';

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));

// Funciones de base de datos con JSON
function leerBD() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function guardarBD(datos) {
  fs.writeFileSync(DB_FILE, JSON.stringify(datos, null, 2), 'utf-8');
}

// CRUD ENDPOINTS

// GET - Obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
  const usuarios = leerBD();
  res.json(usuarios);
});

// GET - Obtener un usuario por ID
app.get('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const usuarios = leerBD();
  const usuario = usuarios.find(u => u.id === parseInt(id));
  
  if (!usuario) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }
  res.json(usuario);
});

// POST - Crear nuevo usuario
app.post('/api/usuarios', (req, res) => {
  const { nombre, email, edad, foto } = req.body;
  
  if (!nombre || !email) {
    res.status(400).json({ error: 'Nombre y email son requeridos' });
    return;
  }

  const usuarios = leerBD();
  
  // Verificar que el email sea único
  if (usuarios.some(u => u.email === email)) {
    res.status(400).json({ error: 'El email ya está registrado' });
    return;
  }

  const nuevoUsuario = {
    id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
    nombre,
    email,
    edad: edad ? parseInt(edad) : null,
    createdAt: new Date().toISOString(),
    foto: foto || null
  };

  usuarios.push(nuevoUsuario);
  guardarBD(usuarios);
  
  res.json(nuevoUsuario);
});

// PUT - Actualizar usuario
app.put('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, email, edad, foto } = req.body;

  const usuarios = leerBD();
  const index = usuarios.findIndex(u => u.id === parseInt(id));
  
  if (index === -1) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  // Verificar que el email sea único (si cambió)
  if (email !== usuarios[index].email && usuarios.some(u => u.email === email)) {
    res.status(400).json({ error: 'El email ya está registrado' });
    return;
  }

  usuarios[index] = {
    ...usuarios[index],
    nombre,
    email,
    edad: edad ? parseInt(edad) : null,
    foto: foto !== undefined ? foto : usuarios[index].foto
  };

  guardarBD(usuarios);
  res.json(usuarios[index]);
});

// DELETE - Eliminar usuario
app.delete('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;

  const usuarios = leerBD();
  const index = usuarios.findIndex(u => u.id === parseInt(id));
  
  if (index === -1) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  usuarios.splice(index, 1);
  guardarBD(usuarios);
  res.json({ message: 'Usuario eliminado' });
});

// ========== AUTENTICACIÓN ==========

// Credenciales de prueba (en producción usar base de datos real)
const USUARIOS_VALIDOS = {
  'admin': 'admin123',
  'user': 'user123'
};

// POST - Login
app.post('/api/login', (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    return;
  }

  // Validar credenciales
  if (USUARIOS_VALIDOS[usuario] !== contrasena) {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    return;
  }

  // Generar token simple (en producción usar JWT)
  const token = Buffer.from(`${usuario}:${Date.now()}`).toString('base64');

  res.json({
    token,
    usuario,
    message: 'Autenticación exitosa'
  });
});

// Middleware para verificar autenticación
function verificarAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [usuario] = decoded.split(':');
    
    if (!USUARIOS_VALIDOS[usuario]) {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// Proteger endpoints de usuarios con autenticación
app.get('/api/usuarios', verificarAuth, (req, res) => {
  const usuarios = leerBD();
  res.json(usuarios);
});

app.get('/api/usuarios/:id', verificarAuth, (req, res) => {
  const { id } = req.params;
  const usuarios = leerBD();
  const usuario = usuarios.find(u => u.id === parseInt(id));
  
  if (!usuario) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  res.json(usuario);
});

app.post('/api/usuarios', verificarAuth, (req, res) => {
  const { nombre, email, edad, foto } = req.body;
  
  if (!nombre || !email) {
    res.status(400).json({ error: 'Nombre y email son requeridos' });
    return;
  }

  const usuarios = leerBD();
  
  if (usuarios.some(u => u.email === email)) {
    res.status(400).json({ error: 'El email ya está registrado' });
    return;
  }

  const nuevoUsuario = {
    id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
    nombre,
    email,
    edad: edad ? parseInt(edad) : null,
    createdAt: new Date().toISOString(),
    foto: foto || null
  };

  usuarios.push(nuevoUsuario);
  guardarBD(usuarios);
  
  res.json(nuevoUsuario);
});

app.put('/api/usuarios/:id', verificarAuth, (req, res) => {
  const { id } = req.params;
  const { nombre, email, edad, foto } = req.body;

  const usuarios = leerBD();
  const index = usuarios.findIndex(u => u.id === parseInt(id));
  
  if (index === -1) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  if (email !== usuarios[index].email && usuarios.some(u => u.email === email)) {
    res.status(400).json({ error: 'El email ya está registrado' });
    return;
  }

  usuarios[index] = {
    ...usuarios[index],
    nombre,
    email,
    edad: edad ? parseInt(edad) : null,
    foto: foto !== undefined ? foto : usuarios[index].foto
  };

  guardarBD(usuarios);
  res.json(usuarios[index]);
});

app.delete('/api/usuarios/:id', verificarAuth, (req, res) => {
  const { id } = req.params;

  const usuarios = leerBD();
  const index = usuarios.findIndex(u => u.id === parseInt(id));
  
  if (index === -1) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  usuarios.splice(index, 1);
  guardarBD(usuarios);
  res.json({ message: 'Usuario eliminado' });
});

// Servir index.html para la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📡 API REST disponible en http://localhost:${PORT}/api/usuarios`);
  console.log(`🔐 Login en http://localhost:${PORT}/src/html/login.html`);
});
