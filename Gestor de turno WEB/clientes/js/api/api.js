/* =========================================================================
   1. ESTADO GLOBAL Y CONFIGURACIÓN (CONECTADO A NODE.JS)
========================================================================= */
const API_BASE = 'http://localhost:3000/api'; // Apunta a tu servidor Node.js real

const estado = {
  token: null, usuario: null, especialidades: [], turnos: [],
  usuarios: [], pendientes: [], estadisticas: null, agendas: [],
  calendario: { mesActual: new Date().getMonth(), anioActual: new Date().getFullYear() },
  nuevoTurno: { paso: 1, especialidadId: null, fecha: '', hora: '' }
};

/* Simulador de llamadas al servidor (Para lo que aún no está en la Base de Datos) */
async function llamarApi(ruta, metodo = 'GET', cuerpo = null) {
  
  if (ruta === '/login') {
    const { username, password } = cuerpo;
    
    // Contraseña por defecto para todas las cuentas de prueba
    if (password !== '1234') {
        return { success: false, error: 'Contraseña incorrecta (Por ahora usa: 1234)' };
    }

    // Cuenta ADMINISTRADOR
    if (username === 'admin') {
        return { success: true, token: 'tok_admin', usuario: { id: 1, username: 'admin', nombreCompleto: 'Admin Principal', rol: 'ADMIN' } };
    }
    // Cuenta ESPECIALISTA (Doctor)
    else if (username === 'doctor') {
        return { success: true, token: 'tok_doc', usuario: { id: 101, username: 'doc.roberto', nombreCompleto: 'Dr. Roberto García', rol: 'DOCTOR', especialidadId: 1 } }; // Asignado a Cardiología (id:1)
    }
    // Cuenta PACIENTE
    else if (username === 'paciente') {
        return { success: true, token: 'tok_pac', usuario: { id: 103, username: 'paciente1', nombreCompleto: 'Juan Pérez', rol: 'PACIENTE' } };
    }
    
    return { success: false, error: 'Usuario no encontrado (Prueba: admin, doctor, o paciente)' };
  }
  
  if (ruta === '/especialidades') {
    if (estado.especialidades.length === 0) {
      return { success: true, data: [
        { id: 1, nombre: 'Cardiología', color: '#dc2626', icono: '❤️' },
        { id: 2, nombre: 'Pediatría', color: '#3b82f6', icono: '👶' }
      ]};
    }
    return { success: true, data: estado.especialidades };
  }

  if (ruta === '/usuarios') {
    if (estado.usuarios.length === 0) {
      return { success: true, data: [
        { id: 101, username: 'doc.roberto', nombreCompleto: 'Dr. Roberto García', rol: 'DOCTOR', especialidadId: 1, aprobado: true },
        { id: 102, username: 'doc.maria', nombreCompleto: 'Dra. María López', rol: 'DOCTOR', especialidadId: 2, aprobado: true },
        { id: 103, username: 'paciente1', nombreCompleto: 'Juan Pérez', rol: 'PACIENTE', especialidadId: null, aprobado: true }
      ]};
    }
    return { success: true, data: estado.usuarios };
  }

  if (ruta === '/usuarios/pendientes') return { success: true, data: estado.pendientes };
  if (ruta === '/estadisticas') return { success: true, data: { turnos: {pendientes:0, completados:0}, usuarios: {doctores:2, pacientes:1}, turnosPorEspecialidad: {} } };

  return { success: true, data: [] };
}

/* Objeto para ejecutar las llamadas */
const api = {
  login: (username, password) => llamarApi('/login', 'POST', { username, password }),
  logout: () => llamarApi('/logout', 'POST'),
  getEspecialidades: () => llamarApi('/especialidades'),
  getUsuarios: () => llamarApi('/usuarios'),
  cambiarEstado: (id, est) => {
    const t = estado.turnos.find(x => x.id === id);
    if(t) t.estado = est;
    return Promise.resolve({ success: true, data: t });
  },

  // =======================================================
  // CONEXIÓN REAL CON EL BACKEND NODE.JS PARA TURNOS
  // =======================================================
  getTurnos: async () => {
    try {
      // Petición real a tu base de datos MySQL
      const respuesta = await fetch(`${API_BASE}/turnos`);
      const datosBD = await respuesta.json();
      
      // Adaptamos los datos de la base de datos al formato que espera tu frontend visual
      const turnosFormateados = datosBD.map(t => ({
        id: t.id,
        codigoTurno: `T-${t.id}`, 
        especialidadId: t.especialidad,
        fecha: t.fecha,
        hora: t.hora,
        estado: 'PENDIENTE', 
        pacienteNombre: t.paciente
      }));
      
      estado.turnos = turnosFormateados;
      return { success: true, data: turnosFormateados };
    } catch (error) {
      console.error('Error al conectar con Node.js, asegúrate de que el servidor esté encendido:', error);
      return { success: true, data: estado.turnos }; // Fallback a datos en memoria si el server está apagado
    }
  },

  crearTurno: async (datos) => {
    try {
      // Enviamos el nuevo turno a tu base de datos MySQL
      const respuesta = await fetch(`${API_BASE}/turnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente: estado.usuario.nombreCompleto,
          fecha: datos.fecha,
          hora: datos.hora,
          especialidad: datos.especialidadId
        })
      });
      
      await respuesta.json();
      await api.getTurnos(); // Recargamos la lista desde la base de datos para ver el nuevo turno
      return { success: true };
    } catch (error) {
      console.error('Error al guardar en Node.js:', error);
      return { success: false, error: 'No se pudo conectar al servidor' };
    }
  }
};