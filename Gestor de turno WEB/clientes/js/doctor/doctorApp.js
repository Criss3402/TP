async function cambiarEstadoTurno(id, est) { await api.cambiarEstado(id, est); notificar('Estado actualizado'); renderMisTurnos(); }
function guardarAgendaDoctor() {
  const diaSemana = document.getElementById('doc-agenda-dia').value;
  const horaInicio = document.getElementById('doc-agenda-inicio').value;
  const horaFin = document.getElementById('doc-agenda-fin').value;

  if (diaSemana === "" || !horaInicio || !horaFin) { notificar('Por favor, completa todos los campos.', 'error'); return; }
  if (horaInicio >= horaFin) { notificar('La hora de entrada debe ser anterior a la de salida.', 'error'); return; }

  // Almacenamos mapeando automáticamente la especialidad y el ID del doctor logueado
  estado.agendas.push({
    id: Date.now(),
    especialidadId: parseInt(estado.usuario.especialidadId),
    doctorId: parseInt(estado.usuario.id),
    diaSemana: parseInt(diaSemana),
    horaInicio,
    horaFin
  });

  notificar('✅ Tu horario de atención ha sido actualizado.');
  renderMiAgendaDoctor();
}

function borrarAgendaDoctor(id) {
  if (!confirm('¿Deseas eliminar este bloque de tu horario de atención?')) return;
  estado.agendas = estado.agendas.filter(a => a.id !== id);
  notificar('🗑️ Horario eliminado.');
  renderMiAgendaDoctor();
}