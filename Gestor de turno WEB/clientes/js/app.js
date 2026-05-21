/* =========================================================================
   CONTROLADOR PRINCIPAL Y NAVEGACIÓN
========================================================================= */

async function ejecutarLogin(tipoPortal) {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;
  
  const mostrarError = (msg) => {
    if (tipoPortal === 'PACIENTE') mostrarLoginPaciente(msg);
    else mostrarLoginPersonal(msg);
  };

  if (!username || !password) { mostrarError('Completá tu usuario y contraseña.'); return; }

  try {
    const res = await api.login(username, password);
    if (!res.success) { mostrarError(res.error); return; }

    const esPaciente = res.usuario.rol === 'PACIENTE';
    
    // Validación de seguridad por portal
    if (tipoPortal === 'PACIENTE' && !esPaciente) {
      mostrarError('Esta cuenta pertenece al personal. Usá el Portal Personal.');
      return;
    }
    if (tipoPortal === 'PERSONAL' && esPaciente) {
      mostrarError('Esta cuenta pertenece a un paciente. Usá el Portal Pacientes.');
      return;
    }

    estado.token = res.token;
    estado.usuario = res.usuario;
    await cargarDatosIniciales();
    navegarA('dashboard');
  } catch (err) {
    mostrarError('Error al conectar con el servidor.');
  }
}

async function cerrarSesion() {
  estado.token = null;
  estado.usuario = null;
  mostrarPantallaInicio(); 
}

async function cargarDatosIniciales() {
  const [resEsp, resTurnos, resUsr, resAgendas] = await Promise.all([
    api.getEspecialidades(), 
    api.getTurnos(), 
    api.getUsuarios(),
    Promise.resolve({ success: true, data: estado.agendas }) // Simulamos traer las agendas
  ]);
  
  if (resEsp.success) estado.especialidades = resEsp.data;
  if (resTurnos.success) estado.turnos = resTurnos.data;
  if (resUsr.success) estado.usuarios = resUsr.data;
}

async function navegarA(seccion) {
  if (!tienePermiso(estado.usuario.rol, seccion)) {
    notificar('No tienes permiso para ver esta sección', 'error');
    return; 
  }

  const rutas = {
    dashboard: renderDashboard,
    nuevo_turno: renderNuevoTurno,
    mis_turnos: renderMisTurnos,
    todos_turnos: renderMisTurnos,
    usuarios: renderUsuarios,
    estadisticas: renderEstadisticas,
    gestionar_esp: renderEspecialidades,
    agenda: renderAgenda,          // Admin
    mi_agenda_doc: renderMiAgendaDoctor, // Médico
    historial: renderHistorial,    // Paciente
    pagos: renderPagos,
    suspensiones: renderSuspensiones
  };
  
  if (rutas[seccion]) rutas[seccion](seccion);
}

// ARRANQUE DE LA APLICACIÓN
mostrarPantallaInicio();