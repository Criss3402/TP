function seleccionarEspecialidad(id) {
  estado.nuevoTurno.especialidadId = id;
  estado.nuevoTurno.doctorId = null; 
  estado.nuevoTurno.paso = 2; 
  renderNuevoTurno();
}

function seleccionarDoctor(id) {
  estado.nuevoTurno.doctorId = id;
  estado.nuevoTurno.paso = 3; 
  renderNuevoTurno();
}

function seleccionarTurnoCalendario(fecha, hora) {
  estado.nuevoTurno.fecha = fecha;
  estado.nuevoTurno.hora = hora;
  estado.nuevoTurno.paso = 4; 
  renderNuevoTurno();
}

function irPasoTurno(paso) {
  estado.nuevoTurno.paso = paso;
  renderNuevoTurno();
}

function cambiarMesTurnosPaciente(offset) {
  estado.calendario.mesActual += offset;
  if (estado.calendario.mesActual > 11) { estado.calendario.mesActual = 0; estado.calendario.anioActual++; }
  else if (estado.calendario.mesActual < 0) { estado.calendario.mesActual = 11; estado.calendario.anioActual--; }
  renderNuevoTurno();
}

async function confirmarTurno() {
  // 1. Armamos el "paquete" con los datos exactos que pide tu API
  const paqueteTurno = {
    idPaciente: estado.usuario.id,
    idMedico: estado.nuevoTurno.doctorId,
    fecha: estado.nuevoTurno.fecha,
    hora: estado.nuevoTurno.hora
  };

  // 2. Mandamos el paquete a Supabase y esperamos (await) su respuesta
  const respuesta = await api.crearTurno(paqueteTurno);

  // 3. Evaluamos qué nos respondió la base de datos
  if (respuesta.success) {
    notificar('✅ Turno solicitado con éxito en la nube.');
    
    // 4. Si se guardó, descargamos la lista de turnos fresca para que aparezca
    const resTurnos = await api.getTurnos();
    if (resTurnos.success) {
        estado.turnos = resTurnos.data;
    }

    // 5. Limpiamos la memoria temporal y lo mandamos a su panel de turnos
    estado.nuevoTurno = { paso: 1, especialidadId: null, doctorId: null, fecha: '', hora: '' };
    navegarA('mis_turnos');
    
  } else {
    notificar('❌ Error: ' + respuesta.error, 'error');
  }
}