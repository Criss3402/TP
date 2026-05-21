function editarEspecialista(id) { // Controladores Usuarios / Especialistas
  const usr = estado.usuarios.find(u => u.id === id);
  if (!usr) return;
  document.getElementById('form-titulo').innerText = '✏️ Editar Especialista: ' + usr.nombreCompleto;
  document.getElementById('usr-id').value = usr.id;
  document.getElementById('usr-nombre').value = usr.nombreCompleto;
  document.getElementById('usr-user').value = usr.username;
  document.getElementById('usr-esp').value = usr.especialidadId || '';
}
function guardarEspecialista() {
  const id = document.getElementById('usr-id').value;
  const nombre = document.getElementById('usr-nombre').value.trim();
  const user = document.getElementById('usr-user').value.trim();
  const espId = document.getElementById('usr-esp').value;
  if (!nombre || !user) { notificar('Completá nombre y usuario.', 'error'); return; }

  if (id) {
    const index = estado.usuarios.findIndex(u => u.id == id);
    estado.usuarios[index].nombreCompleto = nombre;
    estado.usuarios[index].username = user;
    estado.usuarios[index].especialidadId = espId;
    notificar('✅ Especialista actualizado.');
  } else {
    estado.usuarios.push({ id: Date.now(), nombreCompleto: nombre, username: user, rol: 'DOCTOR', especialidadId: espId, aprobado: true });
    notificar('✅ Especialista agregado.');
  }
  renderUsuarios();
}
function guardarNuevaEspecialidad() {
  const nombre = document.getElementById('esp-nombre').value.trim();
  const icono = document.getElementById('esp-icono').value.trim() || '🩺';
  const color = document.getElementById('esp-color').value;
  if (!nombre) { notificar('Ingresá el nombre', 'error'); return; }
  estado.especialidades.push({ id: Date.now(), nombre, icono, color });
  notificar('✅ Especialidad agregada');
  renderEspecialidades();
}
function borrarEspecialidad(id) {// Controladores Especialidades

  if (!confirm('¿Eliminar especialidad?')) return;
  estado.especialidades = estado.especialidades.filter(e => e.id !== id);
  notificar('🗑️ Especialidad eliminada');
  renderEspecialidades();
}
// Controladores Agenda
function cambiarMes(offset) {
  estado.calendario.mesActual += offset;
  if (estado.calendario.mesActual > 11) { estado.calendario.mesActual = 0; estado.calendario.anioActual++; }
  else if (estado.calendario.mesActual < 0) { estado.calendario.mesActual = 11; estado.calendario.anioActual--; }
  renderAgenda();
}
function actualizarSelectDoctores(espId) {
  const selectDoc = document.getElementById('agenda-doc');
  if (!espId) { selectDoc.innerHTML = '<option value="">Primero elegí especialidad</option>'; selectDoc.disabled = true; return; }
  const filtrados = estado.usuarios.filter(u => u.rol === 'DOCTOR' && u.especialidadId == espId);
  if (filtrados.length === 0) { selectDoc.innerHTML = '<option value="">No hay especialistas</option>'; selectDoc.disabled = true; } 
  else { selectDoc.innerHTML = filtrados.map(d => `<option value="${d.id}">${d.nombreCompleto}</option>`).join(''); selectDoc.disabled = false; }
}
function guardarAgenda() {
  const especialidadId = document.getElementById('agenda-esp').value;
  const doctorId = document.getElementById('agenda-doc').value;
  const diaSemana = document.getElementById('agenda-dia').value;
  const horaInicio = document.getElementById('agenda-inicio').value;
  const horaFin = document.getElementById('agenda-fin').value;

  if (!especialidadId || !doctorId || diaSemana === "" || !horaInicio || !horaFin) { 
      notificar('Completá todos los campos.', 'error'); return; 
  }
  if (horaInicio >= horaFin) { 
      notificar('Hora de inicio debe ser anterior a la de fin.', 'error'); return; 
  }

  // Guardamos el horario infinito en la memoria temporal
  estado.agendas.push({ 
      id: Date.now(), 
      especialidadId: parseInt(especialidadId), 
      doctorId: parseInt(doctorId), 
      diaSemana: parseInt(diaSemana), // 0=Dom, 1=Lun, 2=Mar...
      horaInicio, 
      horaFin 
  });
  
  notificar('✅ Horario recurrente agregado');
  renderAgenda();
}
function borrarAgenda(id) {
  if (!confirm('¿Eliminar horario del calendario?')) return;
  estado.agendas = estado.agendas.filter(a => a.id !== id);
  notificar('🗑️ Horario eliminado');
  renderAgenda();
}
