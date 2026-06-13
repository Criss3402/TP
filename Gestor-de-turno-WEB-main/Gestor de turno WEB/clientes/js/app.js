async function ejecutarLogin() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;

  if (!username || !password) { mostrarLogin('Completá tu usuario y contraseña.'); return; }

  try {
    const res = await api.login(username, password);
    if (!res.success) { mostrarLogin(res.error); return; }

    estado.token = res.token;
    estado.usuario = res.usuario;
    await cargarDatosIniciales();
    
    window.location.hash = 'dashboard';
    
  } catch (err) {
    mostrarLogin('Error al conectar con el servidor.');
  }
}

async function ejecutarRegistroPaciente() {
  const nombre    = document.getElementById('reg-nombre').value.trim();
  const apellido  = document.getElementById('reg-apellido').value.trim();
  const dni       = document.getElementById('reg-dni').value.trim();
  const telefono  = document.getElementById('reg-tel').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const password  = document.getElementById('reg-pass').value;
  const password2 = document.getElementById('reg-pass2').value;

  if (!nombre || !apellido || !dni || !email || !password) {
    mostrarRegistroPaciente('Completá todos los campos obligatorios.');
    return;
  }
  if (password.length < 4) {
    mostrarRegistroPaciente('La contraseña debe tener al menos 4 caracteres.');
    return;
  }
  if (password !== password2) {
    mostrarRegistroPaciente('Las contraseñas no coinciden.');
    return;
  }

  try {
    const res = await api.crearPaciente({ nombre, apellido, dni, telefono, email, password });
    if (!res.success) { mostrarRegistro(res.error); return; }
    notificar('✅ Cuenta creada. Ya podés iniciar sesión.');
    mostrarLogin();
  } catch (err) {
    mostrarRegistro('Error al conectar con el servidor.');
  }
}

async function cerrarSesion() {
  estado.token = null;
  estado.usuario = null;
  window.location.hash = ''; // Limpia la URL de cualquier rastro
  mostrarPantallaInicio(); 
}

async function cargarDatosIniciales() {
  // Carga real de todas las colecciones necesarias en memoria
  const [resEsp, resTurnos, resUsr, resAgendas] = await Promise.all([
    api.getEspecialidades(),
    api.getTurnos(),
    api.getUsuarios(),
    api.getAgendas()
  ]);
  if (resEsp.success)     estado.especialidades = resEsp.data;
  if (resTurnos.success)  estado.turnos         = resTurnos.data;
  if (resUsr.success)     estado.usuarios       = resUsr.data;
  if (resAgendas.success) estado.agendas        = resAgendas.data;
}

// La función navegarA ahora solo se encarga de cambiar la URL en el navegador
function navegarA(seccion) {
  if (!tienePermiso(estado.usuario.rol, seccion)) {
    notificar('No tenés permisos para acceder a esta sección.', 'error');
    return; 
  }
  window.location.hash = seccion;
}

window.addEventListener('hashchange', () => {
  const seccion = window.location.hash.replace('#', '');

  // Si no hay sección o no hay sesión activa, frena y manda a la pantalla de inicio
  if (!seccion || !estado.usuario) {
    mostrarPantallaInicio();
    return;
  }

  // Verificación estricta de seguridad en el cambio de URL manual
  if (!tienePermiso(estado.usuario.rol, seccion)) {
    notificar('Acceso denegado a esa URL.', 'error');
    window.location.hash = 'dashboard';
    return;
  }

  // DICCIONARIO COMPLETO DE SECCIONES / PÁGINAS DEL HOSPITAL
  const rutas = {
    // Pantalla compartida
    dashboard: renderDashboard,
    
    // URLs del PACIENTE
    nuevo_turno: renderNuevoTurno,
    mis_turnos: renderMisTurnos,
    historial: renderHistorial,
    
    // URLs del MÉDICO
    mi_agenda_doc: renderMiAgendaDoctor,
    atencion: () => renderAtencionTurno(null), // Vista para registrar diagnóstico e inasistencias
    
    // URLs del RECEPCIONISTA
    gestion_medicos:   renderGestionMedicos,   // Gestión de Médicos (Recep + Admin)
    gestion_pacientes: renderGestionPacientes, // Gestión de Pacientes (Recep)
    
    // URLs del ADMINISTRADOR
    usuarios: renderUsuarios,          // Directorio completo de usuarios
    gestionar_esp: renderEspecialidades, // Gestión de Especialidades
    agenda: renderAgenda,              // Horarios de Atención Generales
    todos_turnos: renderMisTurnos,     // Supervisar Turnos del hospital
    pagos: renderPagos,                // Control de Pagos de consultas
    suspensiones: renderSuspensiones   // Control de Inasistencias y Límites
  };
  
  // Si la ruta copiada en la URL es válida, la ejecuta; si no, va al dashboard base
  if (rutas[seccion]) {
    rutas[seccion](seccion);
  } else {
    window.location.hash = 'dashboard';
  }
});

if (window.location.hash !== '') {
    window.location.hash = '';
} else {
    mostrarPantallaInicio();
}