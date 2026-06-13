async function cambiarEstadoTurno(id, est) { 
  // 1. Mandamos la orden a la nube
  const respuesta = await api.cambiarEstado(id, est); 
  
  if(respuesta.success) {
      notificar('✅ Turno actualizado a: ' + est); 
      
      // 2. Descargamos los datos frescos desde Supabase
      const resTurnos = await api.getTurnos();
      
      // 3. Actualizamos la memoria de la página y redibujamos la tabla
      if(resTurnos.success) {
          estado.turnos = resTurnos.data;
          renderMisTurnos(); 
      }
  } else {
      notificar('❌ ' + respuesta.error, 'error');
  }
}
async function guardarAgendaDoctor() {
  const diaSemana = document.getElementById('doc-agenda-dia').value;
  const horaInicio = document.getElementById('doc-agenda-inicio').value;
  const horaFin = document.getElementById('doc-agenda-fin').value;

  if (diaSemana === "" || !horaInicio || !horaFin) { notificar('Por favor, completa todos los campos.', 'error'); return; }
  if (horaInicio >= horaFin) { notificar('La hora de entrada debe ser anterior a la de salida.', 'error'); return; }

  const respuesta = await api.crearAgenda({
    doctorId:  parseInt(estado.usuario.id),
    diaSemana: parseInt(diaSemana),
    horaInicio,
    horaFin
  });

  if (!respuesta.success) { notificar('❌ ' + respuesta.error, 'error'); return; }

  const resAgendas = await api.getAgendas();
  if (resAgendas.success) estado.agendas = resAgendas.data;

  notificar('✅ Tu horario de atención ha sido actualizado.');
  renderMiAgendaDoctor();
}

async function borrarAgendaDoctor(id) {
  if (!confirm('¿Deseas eliminar este bloque de tu horario de atención?')) return;

  const respuesta = await api.borrarAgenda(id);

  if (!respuesta.success) { notificar('❌ ' + respuesta.error, 'error'); return; }

  const resAgendas = await api.getAgendas();
  if (resAgendas.success) estado.agendas = resAgendas.data;

  notificar('🗑️ Horario eliminado.');
  renderMiAgendaDoctor();
}