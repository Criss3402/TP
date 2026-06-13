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
  window.location.hash = '';
  mostrarPantallaInicio(); 
}

async function cargarDatosIniciales() {
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

function navegarA(seccion) {
  if (!tienePermiso(estado.usuario.rol, seccion)) {
    notificar('No tenés permisos para acceder a esta sección.', 'error');
    return; 
  }
  window.location.hash = seccion;
}

window.addEventListener('hashchange', () => {
  const seccion = window.location.hash.replace('#', '');

  if (!seccion || !estado.usuario) {
    mostrarPantallaInicio();
    return;
  }

  if (!tienePermiso(estado.usuario.rol, seccion)) {
    notificar('Acceso denegado a esa URL.', 'error');
    window.location.hash = 'dashboard';
    return;
  }

  const rutas = {
    dashboard: renderDashboard,
    nuevo_turno: renderNuevoTurno,
    mis_turnos: renderMisTurnos,
    historial: renderHistorial,
    mi_agenda_doc: renderMiAgendaDoctor,
    atencion: () => renderAtencionTurno(null),
    gestion_medicos:   renderGestionMedicos,
    gestion_pacientes: renderGestionPacientes,
    usuarios: renderGestionMedicos,
    gestionar_esp: renderEspecialidades,
    agenda: renderAgenda,
    todos_turnos: renderMisTurnos,
    pagos: renderPagos,
    suspensiones: renderSuspensiones
  };
  
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

// Crear usuario genérico (admin u otro rol sin perfil extra)
api.crearUsuarioGenerico = async (email, password, rol) => {
    const { error } = await clienteSupabase
        .from('usuarios')
        .insert([{ email, contrasenia: password, rol }]);
    if (error) {
        if (error.code === '23505') return { success: false, error: 'Ese correo ya está registrado.' };
        return { success: false, error: error.message };
    }
    return { success: true };
};

// Actualizar email y/o contraseña de cualquier usuario
api.actualizarUsuarioGenerico = async (idUsuario, datos) => {
    const campos = {};
    if (datos.email) campos.email = datos.email;
    if (datos.password) campos.contrasenia = datos.password;
    if (datos.rol) campos.rol = datos.rol;
    const { error } = await clienteSupabase
        .from('usuarios')
        .update(campos)
        .eq('id_usuario', idUsuario);
    if (error) return { success: false, error: error.message };
    return { success: true };
};

// Eliminar cualquier usuario (y sus perfiles relacionados por CASCADE)
api.eliminarUsuarioGenerico = async (idUsuario) => {
    const { error } = await clienteSupabase
        .from('usuarios')
        .delete()
        .eq('id_usuario', idUsuario);
    if (error) return { success: false, error: error.message };
    return { success: true };
};