const estado = {
  token: null,
  usuario: null,
  especialidades: [],
  turnos: [],
  usuarios: [],
  agendas: [],
  calendario: { mesActual: new Date().getMonth(), anioActual: new Date().getFullYear() },
  nuevoTurno: { paso: 1, especialidadId: null, doctorId: null, fecha: '', hora: '' }
};

const clienteSupabase = window.supabase.createClient('https://timkuxzckzvqnjvtstwr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbWt1eHpja3p2cW5qdnRzdHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMTI2OTEsImV4cCI6MjA5NDc4ODY5MX0.d5ZcsE2mfqfAOk5DJ_hJgKlASz19aoPLgMSGHzlkqpM');

const extraerPerfil = (perfil) => {
    if (!perfil) return null;
    return Array.isArray(perfil) ? perfil[0] : perfil;
};

const api = {
  login: async (username, password) => {
    const { data, error } = await clienteSupabase
      .from('usuarios')
      .select('*, medicos(*), pacientes(*)')
      .eq('email', username)
      .eq('contrasenia', password)
      .single();

    if (error || !data) return { success: false, error: 'Usuario o contraseña incorrectos' };

    const med = extraerPerfil(data.medicos);
    const pac = extraerPerfil(data.pacientes);
    
    let nombre = 'Admin', apellido = 'General', especialidadId = null;

    if (med && med.nombre) {
        nombre = med.nombre;
        apellido = med.apellido;
        especialidadId = med.id_especialidad;
    } else if (pac && pac.nombre) {
        nombre = pac.nombre;
        apellido = pac.apellido;
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
          nombreCompleto: `${nombre} ${apellido}`.trim() 
      } 
    };
  },

  getEspecialidades: async () => {
    const { data, error } = await clienteSupabase.from('especialidades').select('*');
    if (error) return { success: false, data: [] };
    
    const adaptadas = data.map(esp => ({ 
        id: esp.id_especialidad, 
        nombre: esp.nombre, 
        color: esp.color || '#28C78E',
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
          nombreCompleto: `${nombre} ${apellido}`.trim()
      };
  });
  return { success: true, data: usuariosAdaptados };
},
  
  crearMedico: async (datos) => {
    const { data: usuarioCreado, error: errorUsuario } = await clienteSupabase
      .from('usuarios')
      .insert([{ email: datos.username, rol: 'medico', contrasenia: datos.password || '123456' }])
      .select();

    if (errorUsuario) return { success: false, error: 'No se pudo crear la cuenta.' };

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
    const { data: usuarioCreado, error: errorUsuario } = await clienteSupabase
      .from('usuarios')
      .insert([{ email: datos.email, contrasenia: datos.password, rol: 'paciente' }])
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
    const { error } = await clienteSupabase
      .from('turnos')
      .insert([
        {
          id_paciente: datosTurno.idPaciente,
          id_medico: datosTurno.idMedico,
          fecha: datosTurno.fecha,
          hora: datosTurno.hora,
          estado: 'Solicitado'
        }
      ]);

    if (error) {
      console.error('Error al guardar turno:', error);
      return { success: false, error: 'Falló la conexión al agendar.' };
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
      id:         a.id_horario,
      doctorId:   a.id_medico,
      diaSemana:  a.dia_semana,
      horaInicio: a.hora_inicio,
      horaFin:    a.hora_fin
    }));
    return { success: true, data: adaptadas };
  },

  crearAgenda: async (datos) => {
    const { error } = await clienteSupabase
      .from('horarios_atencion')
      .insert([{
        id_medico:   datos.doctorId,
        dia_semana:  datos.diaSemana,
        hora_inicio: datos.horaInicio,
        hora_fin:    datos.horaFin
      }]);
    if (error) {
      console.error('Error al crear agenda:', error);
      return { success: false, error: 'No se pudo guardar el horario.' };
    }
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
    const { error } = await clienteSupabase
        .from('turnos')
        .insert([{
            id_paciente: datosTurno.idPaciente,
            id_medico:   datosTurno.idMedico,
            fecha:       datosTurno.fecha,
            hora:        datosTurno.hora,
            estado:      'Confirmado'
        }]);
    if (error) return { success: false, error: 'No se pudo crear el turno.' };
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
                email: u.email,
                nombreCompleto: pac ? `${pac.nombre} ${pac.apellido}`.trim() : u.email,
                dni: pac?.dni || '—',
                telefono: pac?.telefono || '—'
            };
        })
    };
};

// Crear cuenta de recepcionista (solo admin puede)
api.crearRecepcionista = async (datos) => {
    const { data: usuarioCreado, error: errorUsuario } = await clienteSupabase
        .from('usuarios')
        .insert([{ email: datos.email, rol: 'recepcionista', contrasenia: datos.password || '123456' }])
        .select();
    if (errorUsuario) {
        console.error('Error Supabase crearRecepcionista:', errorUsuario);
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
        .single();
    if (error) return { success: false, data: null };
    return { success: true, data };
};