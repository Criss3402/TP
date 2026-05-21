/* =========================================================================
   LÓGICA DEL PACIENTE (4 PASOS)
========================================================================= */

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

function confirmarTurno() {
  const datos = estado.nuevoTurno;
  const doctorAsignado = estado.usuarios.find(u => u.id == datos.doctorId);
  
  const nuevo = {
    id: Date.now(),
    codigoTurno: 'T-' + Math.floor(Math.random() * 1000),
    especialidadId: datos.especialidadId,
    fecha: datos.fecha,
    hora: datos.hora,
    estado: 'PENDIENTE',
    pacienteNombre: estado.usuario.nombreCompleto,
    doctorNombre: doctorAsignado ? doctorAsignado.nombreCompleto : 'Asignado'
  };

  estado.turnos.push(nuevo);
  notificar('✅ Turno solicitado con éxito.');
  estado.nuevoTurno = { paso: 1, especialidadId: null, doctorId: null, fecha: '', hora: '' };
  navegarA('mis_turnos');
}