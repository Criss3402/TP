// --- Controladores Usuarios / Especialistas ---

function editarEspecialista(id) { 
  const usr = estado.usuarios.find(u => u.id === id);
  if (!usr) return;
  document.getElementById('form-titulo').innerText = '✏️ Editar Especialista: ' + usr.nombreCompleto;
  document.getElementById('usr-id').value = usr.id;
  document.getElementById('usr-nombre').value = usr.nombreCompleto;
  document.getElementById('usr-user').value = usr.username;
  document.getElementById('usr-esp').value = usr.especialidadId || '';
}

async function guardarEspecialista() {
  try {
    const id = document.getElementById('usr-id').value;
    const nombreInput = document.getElementById('usr-nombre').value.trim();
    
    // El famoso .split() en acción
    const palabras = nombreInput.split(' ');
    const nombre = palabras[0];
    const apellido = palabras[1] || '';

    const user = document.getElementById('usr-user').value.trim();
    const dni = document.getElementById('usr-dni').value.trim();
    const telefono = document.getElementById('usr-tel').value.trim();
    const matricula = document.getElementById('usr-matricula').value.trim();
    const espId = document.getElementById('usr-esp').value;

    if (!nombreInput || !user || !dni || !matricula) {
      notificar('Completá nombre, usuario, DNI y matrícula.', 'error');
      return;
    }

    if (id) {
      const index = estado.usuarios.findIndex(u => u.id == id);
      if(index !== -1) {
         estado.usuarios[index].nombreCompleto = nombreInput;
         estado.usuarios[index].username = user;
         estado.usuarios[index].dni = dni;
         estado.usuarios[index].telefono = telefono;
         estado.usuarios[index].matricula = matricula;
         estado.usuarios[index].especialidadId = espId;
         notificar('✅ Especialista actualizado.');
      }
    } else {
      // Armamos el objeto para mandarlo a la nube
      const nuevoMedico = { 
          nombre: nombre, 
          apellido: apellido, 
          username: user, 
          dni: dni, 
          telefono: telefono, 
          matricula: matricula, 
          especialidadId: espId || null
      };
      
      const respuesta = await api.crearMedico(nuevoMedico);
      
      if (respuesta.success) {
          notificar('✅ Especialista agregado en la nube.');
          
          // Volvemos a descargar la lista para que la tabla se actualice sola
          const datosNuevos = await api.getUsuarios();
          if(datosNuevos.success) {
              estado.usuarios = datosNuevos.data;
          }

          // Limpiamos los cajoncitos para que quede prolijo
          document.getElementById('usr-nombre').value = '';
          document.getElementById('usr-user').value = '';
          document.getElementById('usr-dni').value = '';
          document.getElementById('usr-tel').value = '';
          document.getElementById('usr-matricula').value = '';
          document.getElementById('usr-esp').value = '';
          
      } else {
          notificar('❌ Error de la BD: ' + respuesta.error, 'error');
      }
    }
    
    renderUsuarios();

  } catch (error) {
    console.error("Error capturado en el código:", error);
    notificar('❌ Hubo un error. Revisá la consola (F12).', 'error');
  }
}

// --- Controladores Especialidades ---

async function guardarNuevaEspecialidad() {
  const nombre = document.getElementById('esp-nombre').value.trim();
  const color = document.getElementById('esp-color').value;
  
  if (!nombre) { notificar('Ingresá el nombre', 'error'); return; }

  const respuesta = await api.crearEspecialidad(nombre, color);
  
  if (respuesta.success) {
    notificar('✅ Especialidad guardada con su color');
    
    // 2. Descargamos y actualizamos
    const resEsp = await api.getEspecialidades();
    if (resEsp.success) estado.especialidades = resEsp.data;
    
    renderEspecialidades();
  } else {
    notificar('❌ ' + respuesta.error, 'error');
  }
}

async function borrarEspecialidad(id) {
  if (!confirm('¿Eliminar especialidad de la base de datos?')) return;
  
  // 1. Ejecutamos el DELETE en la nube
  const respuesta = await api.borrarEspecialidad(id);
  
  if (respuesta.success) {
    notificar('🗑️ Especialidad eliminada de la nube');
    
    // 2. Descargamos los datos frescos para que desaparezca de la tabla
    const resEsp = await api.getEspecialidades();
    if (resEsp.success) estado.especialidades = resEsp.data;
    
    renderEspecialidades();
  } else {
    notificar(respuesta.error, 'error');
  }
}

// --- Controladores Agenda ---

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

  estado.agendas.push({ 
      id: Date.now(), 
      especialidadId: parseInt(especialidadId), 
      doctorId: parseInt(doctorId), 
      diaSemana: parseInt(diaSemana),
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