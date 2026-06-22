const estado = {
  token: null,
  usuario: null,
  especialidades: [],
  turnos: [],
  usuarios: [],
  agendas: [],
  pagos: [],
  calendario: { mesActual: new Date().getMonth(), anioActual: new Date().getFullYear() },
  nuevoTurno: { paso: 1, especialidadId: null, doctorId: null, fecha: '', hora: '' }
};

const SUPABASE_URL = 'https://timkuxzckzvqnjvtstwr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbWt1eHpja3p2cW5qdnRzdHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMTI2OTEsImV4cCI6MjA5NDc4ODY5MX0.d5ZcsE2mfqfAOk5DJ_hJgKlASz19aoPLgMSGHzlkqpM';
const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const extraerPerfil = (perfil) => {
    if (!perfil) return null;
    return Array.isArray(perfil) ? perfil[0] : perfil;
};

const api = {
  login: async (username, password) => {
    const { data: authData, error: authError } = await clienteSupabase.auth.signInWithPassword({
      email: username,
      password: password
    });
    if (authError || !authData.user) {
      const msgLower = authError?.message?.toLowerCase() || '';
      if (msgLower.includes('email not confirmed') || msgLower.includes('email_not_confirmed')) {
        return { success: false, error: '⚠️ Necesitás confirmar tu email antes de iniciar sesión. Revisá tu bandeja de entrada (y carpeta de spam).' };
      }
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }

    const { data, error } = await clienteSupabase
      .from('usuarios')
      .select('*, medicos(*), pacientes(*)')
      .eq('auth_id', authData.user.id)
      .single();
    if (error || !data) {
      return { success: false, error: 'No se encontró el perfil del usuario.' };
    }

    const med = extraerPerfil(data.medicos);
    const pac = extraerPerfil(data.pacientes);
    
    let nombre = 'Sin', apellido = 'Nombre', especialidadId = null;

    if (med && med.nombre) {
        nombre = med.nombre;
        apellido = med.apellido;
        especialidadId = med.id_especialidad;
    } else if (pac && pac.nombre) {
        nombre = pac.nombre;
        apellido = pac.apellido;
    } else if (data.nombre) {
        nombre = data.nombre;
        apellido = data.apellido || '';
    }

    let rolFrontend = data.rol.toUpperCase(); 
    if (data.rol === 'medico') rolFrontend = 'DOCTOR';
    if (data.rol === 'recepcionista') rolFrontend = 'RECEPCIONISTA';

    return { 
      success: true, 
      token: 'token-real-bd', 
      usuario: { 
          id: data.id_usuario, 
          username: data.email, 
          rol: rolFrontend,
          especialidadId: especialidadId,
          dni: data.dni || '',
          telefono: data.telefono || '',
          nombreCompleto: `${nombre} ${apellido}`.trim(),
          limiteTurnosDia: med?.limite_turnos_dia || 10
      } 
    };
  },

  getEspecialidades: async () => {
    const { data, error } = await clienteSupabase.from('especialidades').select('*');
    if (error) return { success: false, data: [] };
    
    const adaptadas = data.map(esp => ({ 
        id: esp.id_especialidad, 
        nombre: esp.nombre, 
        color: esp.color || '#378ADD',
        icono: '🩺' 
    }));
    return { success: true, data: adaptadas };
  },

 getTurnos: async () => {
    const { data, error } = await clienteSupabase.from('turnos').select('*, medicos(*), pacientes(*)');
    if (error) return { success: false, data: [] };

    const turnosAdaptados = data.map(t => {
        const med = extraerPerfil(t.medicos);
        const pac = extraerPerfil(t.pacientes);

        return {
    id: t.id_turno,
    fecha: t.fecha,
    hora: t.hora,
    estado: t.estado, 
    doctorNombre: med ? `${med.nombre} ${med.apellido}`.trim() : 'Sin asignar',
    pacienteNombre: pac ? `${pac.nombre} ${pac.apellido}`.trim() : 'Sin asignar',
    pacienteId: t.id_paciente,
    especialidadId: med ? med.id_especialidad : null,
    diagnostico: t.diagnostico || '',
    indicaciones: t.indicaciones || ''
};

    });
    return { success: true, data: turnosAdaptados };
  },

  getUsuarios: async () => {
  const { data, error } = await clienteSupabase.from('usuarios').select('*, medicos(*), pacientes(*)');
  if (error) return { success: false, data: [] };

  const usuariosAdaptados = data.map(usr => {
      const med = extraerPerfil(usr.medicos);
      const pac = extraerPerfil(usr.pacientes);
      
      let nombre = 'Sin', apellido = 'Nombre', especialidadId = null;

      if (med && med.nombre) {
          nombre = med.nombre;
          apellido = med.apellido;
          especialidadId = med.id_especialidad;
      } else if (pac && pac.nombre) {
          nombre = pac.nombre;
          apellido = pac.apellido;
      } else if (usr.nombre) {
          nombre = usr.nombre;
          apellido = usr.apellido || '';
      }

      let rolFrontend = usr.rol.toUpperCase();
      if (usr.rol === 'medico') rolFrontend = 'DOCTOR';
      if (usr.rol === 'recepcionista') rolFrontend = 'RECEPCIONISTA';

      return {
    id: usr.id_usuario,
    username: usr.email, 
    rol: rolFrontend, 
    especialidadId: especialidadId,
    dni: usr.dni || '',
    telefono: usr.telefono || '',
    nombreCompleto: `${nombre} ${apellido}`.trim(),
    limiteTurnosDia: med?.limite_turnos_dia || 10
};
  });
  return { success: true, data: usuariosAdaptados };
},
  
  crearMedico: async (datos) => {
    const clienteTemp = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: authData, error: authError } = await clienteTemp.auth.signUp({
      email: datos.username,
      password: datos.password || '123456'
    });
    if (authError || !authData.user) {
      console.error('Error signUp médico:', authError);
      if (authError?.message?.toLowerCase().includes('already')) {
        return { success: false, error: 'Ese correo ya está registrado.' };
      }
      return { success: false, error: 'No se pudo crear la cuenta de acceso: ' + (authError?.message || 'error desconocido') };
    }
    // Detectar usuario falso (email ya registrado pero sin confirmar)
    if (!authData.user.identities || authData.user.identities.length === 0) {
      return { success: false, error: 'Ese correo ya fue registrado previamente pero no confirmó su email. Usá otro correo o pedí que confirme el email anterior.' };
    }

    const { data: usuarioCreado, error: errorUsuario } = await clienteSupabase
      .from('usuarios')
      .insert([{
        email: datos.username, rol: 'medico', auth_id: authData.user.id,
        nombre: datos.nombre, apellido: datos.apellido, dni: datos.dni, telefono: datos.telefono
      }])
      .select();

    if (errorUsuario) {
      if (errorUsuario.code === '23505') return { success: false, error: 'Ese correo ya está registrado.' };
      return { success: false, error: 'No se pudo crear la cuenta.' };
    }

    const idGenerado = usuarioCreado[0].id_usuario;

    const { error: errorMedico } = await clienteSupabase
      .from('medicos')
      .insert([{
          id_medico: idGenerado, 
          nombre: datos.nombre,
          apellido: datos.apellido,
          dni: datos.dni,
          matricula: datos.matricula,
          telefono: datos.telefono,
          id_especialidad: datos.especialidadId
      }]);

    if (errorMedico) return { success: false, error: 'Falló el perfil.' };
    return { success: true };
  },

  crearPaciente: async (datos) => {
    const clienteTemp = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: authData, error: authError } = await clienteTemp.auth.signUp({
      email: datos.email,
      password: datos.password
    });
    if (authError || !authData.user) {
      console.error('Error signUp paciente:', authError);
      if (authError?.message?.toLowerCase().includes('already')) {
        return { success: false, error: 'Ese correo ya está registrado.' };
      }
      return { success: false, error: 'No se pudo crear la cuenta de acceso: ' + (authError?.message || 'error desconocido') };
    }
    // Detectar usuario falso (email ya registrado pero sin confirmar)
    if (!authData.user.identities || authData.user.identities.length === 0) {
      return { success: false, error: 'Ese correo ya fue registrado previamente pero no confirmó su email. Usá otro correo o pedí que confirme el email anterior.' };
    }

    const { data: usuarioCreado, error: errorUsuario } = await clienteSupabase
      .from('usuarios')
      .insert([{ email: datos.email, rol: 'paciente', auth_id: authData.user.id, nombre: datos.nombre, apellido: datos.apellido, dni: datos.dni, telefono: datos.telefono }])
      .select();

    if (errorUsuario) {
      if (errorUsuario.code === '23505') return { success: false, error: 'Ese correo ya está registrado.' };
      return { success: false, error: 'No se pudo crear la cuenta.' };
    }

    const idGenerado = usuarioCreado[0].id_usuario;

    const { error: errorPaciente } = await clienteSupabase
      .from('pacientes')
      .insert([{
        id_paciente: idGenerado,
        nombre:      datos.nombre,
        apellido:    datos.apellido,
        dni:         datos.dni,
        telefono:    datos.telefono
      }]);

    if (errorPaciente) {
      if (errorPaciente.code === '23505') return { success: false, error: 'Ese DNI ya está registrado.' };
      return { success: false, error: 'No se pudo crear el perfil del paciente.' };
    }
    return { success: true };
},

  crearTurno: async (datosTurno) => {
    const { data, error } = await clienteSupabase
      .from('turnos')
      .insert([
        {
          id_paciente: datosTurno.idPaciente,
          id_medico: datosTurno.idMedico,
          fecha: datosTurno.fecha,
          hora: datosTurno.hora,
          estado: 'Solicitado'
        }
      ])
      .select();

    if (error) {
      console.error('Error al guardar turno:', error);
      return { success: false, error: 'Falló la conexión al agendar.' };
    }

    if (data && data[0]) {
      await api.crearPago(data[0].id_turno);
    }
    return { success: true };
  },

cambiarEstado: async (idTurno, nuevoEstado, diagnostico = null, indicaciones = null) => {
    const campos = { estado: nuevoEstado };
    if (diagnostico)  campos.diagnostico  = diagnostico;
    if (indicaciones) campos.indicaciones = indicaciones;
    const { error } = await clienteSupabase
      .from('turnos')
      .update(campos)
      .eq('id_turno', idTurno);

    if (error) {
      console.error('Error al actualizar:', error);
      return { success: false, error: 'No se pudo cambiar el estado.' };
    }
    
    return { success: true };
  },

  crearEspecialidad: async (nombreEsp, colorEsp) => {
    const { error } = await clienteSupabase
      .from('especialidades')
      .insert([{ nombre: nombreEsp, color: colorEsp }]);

    if (error) {
      console.error('Error al crear especialidad:', error);
      return { success: false, error: 'No se pudo guardar la especialidad.' };
    }
    return { success: true };
  },

  borrarEspecialidad: async (idEspecialidad) => {
    const { error } = await clienteSupabase
      .from('especialidades')
      .delete()
      .eq('id_especialidad', idEspecialidad);

    if (error) {
      console.error('Error al eliminar:', error);
      return { success: false, error: 'No se puede borrar si hay médicos asignados a esta rama.' };
    }
    return { success: true };
  },

  getAgendas: async () => {
    const { data, error } = await clienteSupabase.from('horarios_atencion').select('*');
    if (error) {
      console.error('Error al obtener agendas:', error);
      return { success: false, data: [] };
    }
    const adaptadas = data.map(a => ({
      id:               a.id_horario,
      doctorId:         a.id_medico,
      diaSemana:        a.dia_semana,
      horaInicio:       a.hora_inicio,
      horaFin:          a.hora_fin,
      duracionMinutos:  a.duracion_minutos || 30
    }));
    return { success: true, data: adaptadas };
  },

 crearAgenda: async (datos) => {
    const { error } = await clienteSupabase
      .from('horarios_atencion')
      .insert([{
        id_medico:         datos.doctorId,
        dia_semana:        datos.diaSemana,
        hora_inicio:       datos.horaInicio,
        hora_fin:          datos.horaFin,
        duracion_minutos:  datos.duracionMinutos || 30
      }]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  borrarAgenda: async (idAgenda) => {
    const { error } = await clienteSupabase
      .from('horarios_atencion')
      .delete()
      .eq('id_horario', idAgenda);
    if (error) {
      console.error('Error al eliminar agenda:', error);
      return { success: false, error: 'No se pudo eliminar el horario.' };
    }
    return { success: true };
  }
};

// tienePermiso y filtrarTurnosPorRol están definidos en permisos.js
// ── NUEVAS FUNCIONES PARA RECEPCIONISTA ──────────────────────────────────

// Eliminar médico (borra perfil médico + usuario)
api.eliminarMedico = async (idUsuario) => {
    const { error: e1 } = await clienteSupabase.from('medicos').delete().eq('id_medico', idUsuario);
    if (e1) return { success: false, error: 'No se pudo eliminar el perfil médico.' };
    const { error: e2 } = await clienteSupabase.from('usuarios').delete().eq('id_usuario', idUsuario);
    if (e2) return { success: false, error: 'No se pudo eliminar la cuenta.' };
    return { success: true };
};

// Actualizar datos de médico
api.actualizarMedico = async (idUsuario, datos) => {
    const { error } = await clienteSupabase
        .from('medicos')
        .update({
            nombre: datos.nombre,
            apellido: datos.apellido,
            dni: datos.dni,
            telefono: datos.telefono,
            matricula: datos.matricula,
            id_especialidad: datos.especialidadId || null
        })
        .eq('id_medico', idUsuario);
    if (error) return { success: false, error: 'No se pudo actualizar el médico.' };
    return { success: true };
};

// Actualizar email del usuario
api.actualizarEmailUsuario = async (idUsuario, email) => {
    const { error } = await clienteSupabase
        .from('usuarios')
        .update({ email })
        .eq('id_usuario', idUsuario);
    if (error) return { success: false, error: 'No se pudo actualizar el correo.' };
    return { success: true };
};

// Crear turno desde recepcionista (en nombre de un paciente)
api.crearTurnoRecepcionista = async (datosTurno) => {
    const { data, error } = await clienteSupabase
        .from('turnos')
        .insert([{
            id_paciente: datosTurno.idPaciente,
            id_medico:   datosTurno.idMedico,
            fecha:       datosTurno.fecha,
            hora:        datosTurno.hora,
            estado:      'Confirmado'
        }])
        .select();
    if (error) return { success: false, error: 'No se pudo crear el turno.' };
    if (data && data[0]) {
      await api.crearPago(data[0].id_turno);
    }
    return { success: true };
};

// Obtener solo pacientes
api.getPacientes = async () => {
    const { data, error } = await clienteSupabase
        .from('usuarios')
        .select('*, pacientes(*)')
        .eq('rol', 'paciente');
    if (error) return { success: false, data: [] };
    return {
        success: true,
        data: data.map(u => {
            const pac = Array.isArray(u.pacientes) ? u.pacientes[0] : u.pacientes;
            return {
                id: u.id_usuario,
                idPaciente: pac?.id_paciente || null,
                email: u.email,
                nombreCompleto: pac ? `${pac.nombre} ${pac.apellido}`.trim() : u.email,
                dni: pac?.dni || '—',
                telefono: pac?.telefono || '—',
                ausencias: pac?.cantidad_ausencias || 0,
                suspendido: pac?.estado_suspension || false,
                motivoSuspension: pac?.motivo_suspension || ''
            };
        })
    };
};

// Crear cuenta de recepcionista (solo admin puede)
api.crearRecepcionista = async (datos) => {
    const clienteTemp = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: authData, error: authError } = await clienteTemp.auth.signUp({
        email: datos.email,
        password: datos.password || '123456'
    });
    if (authError || !authData.user) {
        console.error('Error signUp recepcionista:', authError);
        if (authError?.message?.toLowerCase().includes('already')) {
            return { success: false, error: 'Ese correo ya está registrado.' };
        }
        return { success: false, error: 'No se pudo crear la cuenta de acceso: ' + (authError?.message || 'error desconocido') };
    }
    if (!authData.user.identities || authData.user.identities.length === 0) {
        return { success: false, error: 'Ese correo ya fue registrado previamente pero no confirmó su email.' };
    }

    const { error: errorUsuario } = await clienteSupabase
        .from('usuarios')
        .insert([{ email: datos.email, rol: 'recepcionista', auth_id: authData.user.id }])
        .select();
    if (errorUsuario) {
        if (errorUsuario.code === '23505') return { success: false, error: 'Ese correo ya está registrado.' };
        return { success: false, error: `Error BD: ${errorUsuario.message}` };
    }
    return { success: true };
};
api.registrarAusencia = async (idPaciente) => {
    // Incrementar contador de ausencias
    const { data, error: errorGet } = await clienteSupabase
        .from('pacientes')
        .select('cantidad_ausencias')
        .eq('id_paciente', idPaciente)
        .single();

    if (errorGet) return { success: false, error: 'No se pudo obtener el paciente.' };

    const nuevaCantidad = (data.cantidad_ausencias || 0) + 1;
    const suspender = nuevaCantidad >= 3;

    const campos = { cantidad_ausencias: nuevaCantidad };
    if (suspender) {
        campos.estado_suspension = true;
        campos.motivo_suspension = `Suspendido automáticamente por ${nuevaCantidad} inasistencias.`;
    }

    const { error } = await clienteSupabase
        .from('pacientes')
        .update(campos)
        .eq('id_paciente', idPaciente);

    if (error) return { success: false, error: 'No se pudo registrar la ausencia.' };
    return { success: true, suspendido: suspender, cantidad: nuevaCantidad };
};

api.getPacientePorUsuario = async (idUsuario) => {
    const { data, error } = await clienteSupabase
        .from('pacientes')
        .select('*')
        .eq('id_paciente', idUsuario)
        .maybeSingle();
    if (error) return { success: false, data: null };
    return { success: true, data };
};

api.suspenderPaciente = async (idPaciente, motivo) => {
    const { error } = await clienteSupabase
        .from('pacientes')
        .update({ estado_suspension: true, motivo_suspension: motivo })
        .eq('id_paciente', idPaciente);
    if (error) return { success: false, error: error.message };
    return { success: true };
};

api.reactivarPaciente = async (idPaciente) => {
    const { error } = await clienteSupabase
        .from('pacientes')
        .update({ estado_suspension: false, motivo_suspension: null, cantidad_ausencias: 0 })
        .eq('id_paciente', idPaciente);
    if (error) return { success: false, error: error.message };
    return { success: true };
};

api.crearPago = async (idTurno) => {
    const { error } = await clienteSupabase
        .from('pagos')
        .insert([{ id_turno: idTurno, monto: 5000, estado_pago: 'Pendiente' }]);
    if (error) return { success: false, error: error.message };
    return { success: true };
};

api.getPagos = async () => {
    const { data, error } = await clienteSupabase
        .from('pagos')
        .select('*, turnos(*, pacientes(*), medicos(*))');
    if (error) return { success: false, data: [] };

    const adaptados = data.map(p => {
        const turno = p.turnos;
        const pac = turno?.pacientes;
        const med = turno?.medicos;
        return {
            id: p.id_pago,
            turnoId: p.id_turno,
            monto: p.monto,
            metodo: p.metodo || '—',
            estado: p.estado_pago,
            fechaPago: p.fecha_pago,
            pacienteNombre: pac ? `${pac.nombre} ${pac.apellido}`.trim() : 'Sin asignar',
            doctorNombre: med ? `${med.nombre} ${med.apellido}`.trim() : 'Sin asignar',
            fechaTurno: turno?.fecha || ''
        };
    });
    return { success: true, data: adaptados };
};

api.pagarTurno = async (idTurno, metodo) => {
    const { error } = await clienteSupabase
        .from('pagos')
        .update({ estado_pago: 'Pagado', metodo, fecha_pago: new Date().toISOString() })
        .eq('id_turno', idTurno);
    if (error) return { success: false, error: error.message };
    return { success: true };
};

api.getPagoPorTurno = async (idTurno) => {
    const { data, error } = await clienteSupabase
        .from('pagos')
        .select('*')
        .eq('id_turno', idTurno)
        .maybeSingle();
    if (error) return { success: false, data: null };
    return { success: true, data };
};