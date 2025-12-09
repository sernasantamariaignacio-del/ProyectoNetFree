# Gestor de Usuarios con Autenticación

Un aplicación full-stack moderna para gestionar usuarios con autenticación, carga de imágenes de perfil y una API REST.

## 🚀 Características

- ✅ **Autenticación de usuarios** - Login seguro con tokens
- ✅ **CRUD de usuarios** - Crear, leer, actualizar y eliminar usuarios
- ✅ **Carga de imágenes** - Perfil de usuario con foto
- ✅ **API REST** - Endpoints protegidos con autenticación
- ✅ **Base de datos JSON** - Almacenamiento simple sin dependencias externas
- ✅ **Frontend reactivo** - Alpine.js para interactividad
- ✅ **Diseño responsive** - Tailwind CSS para estilos modernos

## 🛠 Stack Tecnológico

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **body-parser** - Middleware para parsear JSON (incluye base64 de imágenes)
- **cors** - Manejo de CORS

### Frontend
- **HTML5** - Estructura
- **Alpine.js v3** - Interactividad y reactividad
- **Tailwind CSS v4** - Estilos y diseño

### Base de Datos
- **JSON** - Almacenamiento en archivo (`usuarios.json`)

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- pnpm (o npm/yarn)

## ⚙️ Instalación

1. **Clonar el repositorio**
```bash
git clone <URL-DEL-REPOSITORIO>
cd "Proyecto tailwind"
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Iniciar el servidor de desarrollo**
```bash
pnpm start
```

El servidor estará disponible en:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3000/api/usuarios
- **Login:** http://localhost:3000/src/html/login.html

## 📖 Uso

### Credenciales de Prueba

| Usuario | Contraseña |
|---------|-----------|
| admin   | admin123  |
| user    | user123   |

### Funcionalidades

#### 1. **Acceso**
- Accede a http://localhost:3000/
- Haz clic en "Iniciar Sesión"
- Usa las credenciales de prueba

#### 2. **Gestionar Usuarios**
- **Ver:** Lista de todos los usuarios
- **Crear:** Completa el formulario y haz clic en "Crear Usuario"
- **Editar:** Haz clic en "Editar", modifica los datos y actualiza
- **Eliminar:** Haz clic en "Eliminar" y confirma

#### 3. **Foto de Perfil**
- Soporta JPG y PNG
- Máximo 2MB
- Se almacena como base64 en la base de datos
- Se muestra como avatar en la tabla

#### 4. **Cerrar Sesión**
- Haz clic en "Cerrar Sesión" en el header

## 🗂️ Estructura del Proyecto

```
Proyecto tailwind/
├── index.html                 # Página principal
├── server.js                  # Backend Express
├── package.json               # Dependencias
├── tailwind.config.js         # Configuración Tailwind
├── usuarios.json              # Base de datos (se crea automáticamente)
├── .gitignore                 # Archivos a ignorar en git
├── README.md                  # Este archivo
├── js/
│   └── app.js                 # Lógica compartida (API, funciones)
├── src/
│   ├── input.css              # CSS de entrada para Tailwind
│   ├── output.css             # CSS compilado
│   ├── assets/                # Recursos (imágenes, etc)
│   └── html/
│       ├── login.html         # Página de login
│       └── usuarios.html      # Gestor de usuarios
```

## 🔧 Scripts Disponibles

```bash
# Iniciar servidor y Tailwind watch
pnpm start

# Solo servidor (Node)
pnpm server

# Solo Tailwind watch (desarrollo)
pnpm dev

# Compilar Tailwind (producción)
pnpm build
```

## 🔐 Autenticación

### Cómo Funciona

1. **Login:**
   - El usuario envía credenciales al endpoint `POST /api/login`
   - Se valida contra credenciales almacenadas en servidor
   - Se retorna un token base64

2. **Token:**
   - Se almacena en `localStorage`
   - Se envía en cada petición en el header: `Authorization: Bearer <token>`

3. **Protección:**
   - Todos los endpoints de `/api/usuarios` requieren autenticación
   - Si el token es inválido o expira, se redirige al login

### Agregar Más Usuarios

Edita el objeto `USUARIOS_VALIDOS` en `server.js`:

```javascript
const USUARIOS_VALIDOS = {
  'admin': 'admin123',
  'user': 'user123',
  'nuevoUsuario': 'suContraseña'  // Agregar aquí
};
```

## 💾 Base de Datos

Los usuarios se almacenan en `usuarios.json` con la siguiente estructura:

```json
[
  {
    "id": 1,
    "nombre": "Ignacio",
    "email": "ignacio@ejemplo.com",
    "edad": 30,
    "foto": "data:image/png;base64,...",
    "createdAt": "2025-12-09T16:00:51.838Z"
  }
]
```

## 🚀 Despliegue

Para desplegar a producción:

1. **Compilar Tailwind:**
   ```bash
   pnpm build
   ```

2. **Variables de entorno** (crear `.env`):
   ```
   PORT=3000
   NODE_ENV=production
   ```

3. **Sugerir hosting:**
   - **Heroku** - Fácil despliegue para Node.js
   - **Railway** - Alternativa moderna a Heroku
   - **Render** - Hosting gratuito para Node.js
   - **Vercel/Netlify** - Para frontend estático

## 🐛 Solución de Problemas

### Error 413 (Payload Too Large)
Si las imágenes no se suben, aumenta el límite en `server.js`:
```javascript
app.use(bodyParser.json({ limit: '50mb' }));
```

### CORS Error
El servidor ya tiene CORS habilitado. Si hay problemas, verifica que:
- El servidor está corriendo en http://localhost:3000
- El cliente accede desde la misma URL

### Port 3000 en uso
Cambia el puerto en `server.js`:
```javascript
const PORT = 3001; // Cambiar aquí
```

## 📝 Notas de Desarrollo

- Las credenciales de prueba están hardcodeadas. Para producción, usar base de datos real.
- Las imágenes se codifican a base64 para almacenamiento en JSON.
- Los tokens son simples (base64). Considerar JWT para producción.

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 👤 Autor

Ignacio Zalla

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, contacta a: ignacio17zalla@gmail.com

---

**¡Gracias por usar el Gestor de Usuarios!** 🎉
