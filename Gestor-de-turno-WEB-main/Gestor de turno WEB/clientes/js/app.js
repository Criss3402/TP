async function ejecutarLogin() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;

  if (!username || !password) { mostrarLogin('Completá tu usuario y contraseña.'); return; }

  try {
    // Intentar login con Supabase Auth directamente para detectar email no verificado
    const { data: authCheck, error: authCheckError } = await clienteSupabase.auth.signInWithPassword({
      email: username,
      password: password
    });

    // Si Supabase devuelve error de email no confirmado
    if (authCheckError) {
      const msgLower = authCheckError.message?.toLowerCase() || '';
      if (msgLower.includes('email not confirmed') || msgLower.includes('email_not_confirmed')) {
        mostrarLogin('⚠️ Necesitás confirmar tu email antes de iniciar sesión. Revisá tu bandeja de entrada (y carpeta de spam).');
        // Cerrar la sesión parcial que pudo haber quedado
        await clienteSupabase.auth.signOut();
        return;
      }
    }

    // Si el login de Supabase Auth fue exitoso, continuar con el flujo normal
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
    if (!password || password.length < 6) {
      notificar('Ingresá una contraseña de al menos 6 caracteres.', 'error');
      return;
    }
  if (password !== password2) {
    mostrarRegistroPaciente('Las contraseñas no coinciden.');
    return;
  }

  try {
    const res = await api.crearPaciente({ nombre, apellido, dni, telefono, email, password });
    if (!res.success) { mostrarRegistro(res.error); return; }

    // Enviar email de bienvenida (en segundo plano, no bloquea)
    emailService.enviarBienvenida({
      to_email: email,
      to_name: `${nombre} ${apellido}`.trim()
    }).catch(e => console.warn('No se pudo enviar email de bienvenida:', e));

    // Mostrar pantalla de verificación de email
    mostrarRegistroExitoso(email);
  } catch (err) {
    mostrarRegistro('Error al conectar con el servidor.');
  }
}

async function cerrarSesion() {
  await clienteSupabase.auth.signOut();
  estado.token = null;
  estado.usuario = null;
  window.location.hash = '';
  mostrarPantallaInicio(); 
}

async function cargarDatosIniciales() {
  const [resEsp, resTurnos, resUsr, resAgendas, resPagos] = await Promise.all([
    api.getEspecialidades(),
    api.getTurnos(),
    api.getUsuarios(),
    api.getAgendas(),
    api.getPagos()
  ]);
  if (resEsp.success)     estado.especialidades = resEsp.data;
  if (resTurnos.success)  estado.turnos         = resTurnos.data;
  if (resUsr.success)     estado.usuarios       = resUsr.data;
  if (resAgendas.success) estado.agendas        = resAgendas.data;
  if (resPagos.success)   estado.pagos          = resPagos.data;
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
    usuarios: renderUsuarios,
    gestionar_esp: renderEspecialidades,
    agenda: renderAgenda,
    todos_turnos: renderMisTurnos,
    pagos: renderPagos,
    suspensiones: renderSuspensiones,
    historial_admin: renderHistorialAdmin,
    estadisticas: renderEstadisticas
  };
  
  if (rutas[seccion]) {
    rutas[seccion](seccion);
  } else {
    window.location.hash = 'dashboard';
  }
});

// Crear usuario genérico (admin u otro rol sin perfil extra)
api.crearUsuarioGenerico = async (email, password, rol, nombre, apellido, dni, telefono) => {
    const clienteTemp = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: authData, error: authError } = await clienteTemp.auth.signUp({ email, password });
    if (authError || !authData.user) {
        console.error('Error signUp genérico:', authError);
        if (authError?.message?.toLowerCase().includes('already')) {
            return { success: false, error: 'Ese correo ya está registrado.' };
        }
        return { success: false, error: 'No se pudo crear la cuenta de acceso: ' + (authError?.message || 'error desconocido') };
    }
    // Detectar usuario falso (email ya registrado pero sin confirmar)
    if (!authData.user.identities || authData.user.identities.length === 0) {
        return { success: false, error: 'Ese correo ya fue registrado previamente pero no confirmó su email. Usá otro correo o pedí que confirme el email anterior.' };
    }

    const { data, error } = await clienteSupabase
        .from('usuarios')
        .insert([{ email, rol, auth_id: authData.user.id, nombre, apellido, dni, telefono }])
        .select();
    if (error) {
        if (error.code === '23505') return { success: false, error: 'Ese correo ya está registrado.' };
        return { success: false, error: error.message };
    }
    if (rol === 'paciente' && data && data[0]) {
        await clienteSupabase
            .from('pacientes')
            .insert([{ id_paciente: data[0].id_usuario, nombre, apellido, dni, telefono }]);
    }
    return { success: true };
};

// Actualizar email y/o contraseña de cualquier usuario
api.actualizarUsuarioGenerico = async (idUsuario, datos) => {
    const campos = {};
    if (datos.email)    campos.email      = datos.email;
    if (datos.rol)      campos.rol        = datos.rol;
    if (datos.nombre)   campos.nombre     = datos.nombre;
    if (datos.apellido) campos.apellido   = datos.apellido;
    if (datos.dni)      campos.dni        = datos.dni;
    if (datos.telefono) campos.telefono   = datos.telefono;
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

api.recuperarSesion = async () => {
    const { data: sessionData } = await clienteSupabase.auth.getSession();
    if (!sessionData?.session?.user) return { success: false };

    const { data, error } = await clienteSupabase
        .from('usuarios')
        .select('*, medicos(*), pacientes(*)')
        .eq('auth_id', sessionData.session.user.id)
        .single();
    if (error || !data) return { success: false };

    const med = extraerPerfil(data.medicos);
    const pac = extraerPerfil(data.pacientes);
    let nombre = 'Sin', apellido = 'Nombre', especialidadId = null;
    if (med && med.nombre) { nombre = med.nombre; apellido = med.apellido; especialidadId = med.id_especialidad; }
    else if (pac && pac.nombre) { nombre = pac.nombre; apellido = pac.apellido; }
    else if (data.nombre) { nombre = data.nombre; apellido = data.apellido || ''; }

    let rolFrontend = data.rol.toUpperCase();
    if (data.rol === 'medico') rolFrontend = 'DOCTOR';
    if (data.rol === 'recepcionista') rolFrontend = 'RECEPCIONISTA';

    return {
        success: true,
        usuario: {
            id: data.id_usuario,
            username: data.email,
            rol: rolFrontend,
            especialidadId,
            dni: data.dni || '',
            telefono: data.telefono || '',
            nombreCompleto: `${nombre} ${apellido}`.trim(),
            limiteTurnosDia: med?.limite_turnos_dia || 10
        }
    };
};

(async () => {
  const res = await api.recuperarSesion();
  if (!res.success) {
    if (window.location.hash) window.location.hash = '';
    mostrarPantallaInicio();
    return;
  }
  estado.usuario = res.usuario;
  estado.token = 'auth';
  await cargarDatosIniciales();
  if (!window.location.hash) {
    window.location.hash = 'dashboard';
  } else {
    window.dispatchEvent(new Event('hashchange'));
  }
})();