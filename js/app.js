/**
 * API Service - Maneja todas las peticiones REST
 */
const API = {
  base: '/api',

  getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  async get(endpoint) {
    try {
      const response = await fetch(`${this.base}${endpoint}`, {
        headers: this.getHeaders()
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/src/html/login.html';
        }
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en GET:', error);
      throw error;
    }
  },

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.base}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/src/html/login.html';
        }
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en POST:', error);
      throw error;
    }
  },

  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.base}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/src/html/login.html';
        }
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en PUT:', error);
      throw error;
    }
  },

  async delete(endpoint) {
    try {
      const response = await fetch(`${this.base}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/src/html/login.html';
        }
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en DELETE:', error);
      throw error;
    }
  },

  async postFormData(endpoint, formData) {
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`${this.base}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/src/html/login.html';
        }
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en POST FormData:', error);
      throw error;
    }
  }
};

/**
 * Usuarios Service - Lógica específica de usuarios
 */
const UsuariosService = {
  async obtenerTodos() {
    return API.get('/usuarios');
  },

  async obtenerPorId(id) {
    return API.get(`/usuarios/${id}`);
  },

  async crear(datos) {
    return API.post('/usuarios', datos);
  },

  async actualizar(id, datos) {
    return API.put(`/usuarios/${id}`, datos);
  },

  async eliminar(id) {
    return API.delete(`/usuarios/${id}`);
  }
};

/**
 * Alpine.js App - Controlador de usuarios
 */
function usuariosApp() {
  return {
    usuarios: [],
    formulario: {
      nombre: '',
      email: '',
      edad: ''
    },
    editandoId: null,
    cargando: false,
    error: null,
    previewUrl: null,
    imagenFile: null,

    async cargarUsuarios() {
      try {
        this.cargando = true;
        this.error = null;
        this.usuarios = await UsuariosService.obtenerTodos();
      } catch (error) {
        this.error = 'Error al cargar los usuarios';
        console.error(error);
      } finally {
        this.cargando = false;
      }
    },

    async guardarUsuario() {
      if (!this.formulario.nombre || !this.formulario.email) {
        alert('Por favor completa todos los campos requeridos');
        return;
      }

      try {
        this.cargando = true;
        this.error = null;

        const datos = {
          nombre: this.formulario.nombre,
          email: this.formulario.email,
          edad: this.formulario.edad ? parseInt(this.formulario.edad) : null
        };

        // Si hay imagen seleccionada, convertirla a base64
        if (this.imagenFile) {
          const base64 = await this.convertirImagenABase64(this.imagenFile);
          datos.foto = base64;
        } else if (this.previewUrl && this.previewUrl.startsWith('data:')) {
          // Si ya hay preview en base64
          datos.foto = this.previewUrl;
        }

        if (this.editandoId) {
          await UsuariosService.actualizar(this.editandoId, datos);
          alert('Usuario actualizado correctamente');
        } else {
          await UsuariosService.crear(datos);
          alert('Usuario creado correctamente');
        }

        this.resetearFormulario();
        await this.cargarUsuarios();
      } catch (error) {
        this.error = 'Error al guardar el usuario: ' + error.message;
        alert(this.error);
      } finally {
        this.cargando = false;
      }
    },

    editarUsuario(usuario) {
      this.editandoId = usuario.id;
      this.formulario = {
        nombre: usuario.nombre,
        email: usuario.email,
        edad: usuario.edad
      };
      this.previewUrl = usuario.foto || null;
      window.scrollTo(0, 0);
    },

    previewImagen(event) {
      const file = event.target.files[0];
      if (file) {
        // Validar tamaño (máx 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert('La imagen no debe superar 2MB');
          event.target.value = '';
          return;
        }

        // Guardar archivo
        this.imagenFile = file;

        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    convertirImagenABase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    async eliminarUsuario(id) {
      if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        return;
      }

      try {
        this.cargando = true;
        this.error = null;
        await UsuariosService.eliminar(id);
        alert('Usuario eliminado correctamente');
        await this.cargarUsuarios();
      } catch (error) {
        this.error = 'Error al eliminar el usuario: ' + error.message;
        alert(this.error);
      } finally {
        this.cargando = false;
      }
    },

    resetearFormulario() {
      this.formulario = {
        nombre: '',
        email: '',
        edad: ''
      };
      this.editandoId = null;
      this.previewUrl = null;
      this.imagenFile = null;
    },

    cerrarSesion() {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
        window.location.href = '/src/html/login.html';
      }
    }
  };
}

function loginApp() {
  return {
    usuario: '',
    contrasena: '',
    cargando: false,
    error: null,

    async iniciarSesion() {
      if (!this.usuario || !this.contrasena) {
        this.error = 'Por favor completa todos los campos';
        return;
      }

      try {
        this.cargando = true;
        this.error = null;

        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            usuario: this.usuario,
            contrasena: this.contrasena
          })
        });

        const data = await response.json();

        if (!response.ok) {
          this.error = data.error || 'Error en la autenticación';
          return;
        }

        // Guardar token en localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('usuario', data.usuario);

        // Redirigir a usuarios
        window.location.href = '/src/html/usuarios.html';
      } catch (error) {
        this.error = 'Error al conectar con el servidor: ' + error.message;
      } finally {
        this.cargando = false;
      }
    }
  };
}

