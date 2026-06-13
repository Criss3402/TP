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
// ── CONTROLADORES GESTIÓN MÉDICOS ─────────────────────────────────────────

function abrirFormEditarMedico(id) {
  const usr = estado.usuarios.find(u => u.id === id);
  if (!usr) return;
  document.getElementById('form-med-titulo').innerText = '✏️ Editando: ' + usr.nombreCompleto;
  document.getElementById('med-id').value      = usr.id;
  const partes = usr.nombreCompleto.split(' ');
  document.getElementById('med-nombre').value   = partes[0] || '';
  document.getElementById('med-apellido').value = partes.slice(1).join(' ') || '';
  document.getElementById('med-email').value    = usr.username;
  document.getElementById('med-dni').value      = usr.dni || '';
  document.getElementById('med-tel').value      = usr.telefono || '';
  document.getElementById('med-matricula').value= usr.matricula || '';
  document.getElementById('med-esp').value      = usr.especialidadId || '';
  // Al editar no se cambia la contraseña, ocultamos el campo
  const campoPass = document.getElementById('campo-pass-medico');
  if (campoPass) campoPass.style.display = 'none';
}

async function guardarMedico() {
  const id        = document.getElementById('med-id').value;
  const nombre    = document.getElementById('med-nombre').value.trim();
  const apellido  = document.getElementById('med-apellido').value.trim();
  const email     = document.getElementById('med-email').value.trim();
  const dni       = document.getElementById('med-dni').value.trim();
  const matricula = document.getElementById('med-matricula').value.trim();
  const telefono  = document.getElementById('med-tel').value.trim();
  const espId     = document.getElementById('med-esp').value;
  const password  = document.getElementById('med-pass') ? document.getElementById('med-pass').value : '';

  if (!nombre || !apellido || !email || !dni || !matricula) {
    notificar('Completá nombre, apellido, email, DNI y matrícula.', 'error');
    return;
  }

  if (id) {
    // EDITAR
    const r1 = await api.actualizarMedico(id, { nombre, apellido, dni, telefono, matricula, especialidadId: espId || null });
    const r2 = await api.actualizarEmailUsuario(id, email);
    if (!r1.success || !r2.success) { notificar('❌ Error al actualizar.', 'error'); return; }
    notificar('✅ Médico actualizado correctamente.');
  } else {
    // CREAR — contraseña obligatoria
    if (!password || password.length < 4) {
      notificar('Ingresá una contraseña de al menos 4 caracteres.', 'error');
      return;
    }
    const respuesta = await api.crearMedico({ nombre, apellido, username: email, dni, telefono, matricula, especialidadId: espId || null, password });
    if (!respuesta.success) { notificar('❌ ' + respuesta.error, 'error'); return; }
    notificar('✅ Médico creado. Contraseña: ' + password);
  }

  const datosNuevos = await api.getUsuarios();
  if (datosNuevos.success) estado.usuarios = datosNuevos.data;
  renderGestionMedicos();
}

async function eliminarMedico(id, nombre) {
  if (!confirm(`¿Eliminar al médico ${nombre}? Esta acción no se puede deshacer.`)) return;
  const respuesta = await api.eliminarMedico(id);
  if (!respuesta.success) { notificar('❌ ' + respuesta.error, 'error'); return; }
  notificar('🗑️ Médico eliminado.');
  const datosNuevos = await api.getUsuarios();
  if (datosNuevos.success) estado.usuarios = datosNuevos.data;
  renderGestionMedicos();
}

// ── TURNO DESDE RECEPCIONISTA ─────────────────────────────────────────────

function abrirTurnoParaPaciente(idPaciente, nombrePaciente) {
  const medicos    = estado.usuarios.filter(u => u.rol === 'DOCTOR');
  const opsMedicos = medicos.map(m => `<option value="${m.id}">${m.nombreCompleto}</option>`).join('');

  const modal = document.createElement('div');
  modal.id = 'modal-turno-recep';
  modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999;`;
  modal.innerHTML = `
    <div style="background:white; border-radius:12px; padding:32px; max-width:480px; width:90%; box-shadow:0 20px 40px rgba(0,0,0,0.2);">
      <h3 style="color:${COLOR_MINT.emeraldDark}; font-weight:700; margin-bottom:4px;">📅 Agendar Turno</h3>
      <p style="color:${COLOR_MINT.lightGray}; font-size:13px; margin-bottom:20px;">Paciente: <strong>${nombrePaciente}</strong></p>
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div>
          <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size:13px;">Médico</label>
          <select id="modal-medico" class="input" style="border:1px solid ${COLOR_MINT.mintLight}; background:white; color:#333; width:100%; margin-top:4px;">
            <option value="">Seleccioná un médico...</option>${opsMedicos}
          </select>
        </div>
        <div>
          <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size:13px;">Fecha</label>
          <input id="modal-fecha" type="date" class="input" style="border:1px solid ${COLOR_MINT.mintLight}; background:white; color:#333; width:100%; margin-top:4px;" min="${new Date().toISOString().split('T')[0]}" />
        </div>
        <div>
          <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size:13px;">Hora</label>
          <input id="modal-hora" type="time" class="input" style="border:1px solid ${COLOR_MINT.mintLight}; background:white; color:#333; width:100%; margin-top:4px;" />
        </div>
      </div>
      <div style="display:flex; gap:10px; margin-top:24px;">
        <button class="btn btn-ghost" style="flex:1; border:1px solid ${COLOR_MINT.mintLight}; color:${COLOR_MINT.lightGray};" onclick="document.getElementById('modal-turno-recep').remove()">Cancelar</button>
        <button class="btn btn-primary" style="flex:2; background-color:${COLOR_MINT.vibrantMint}; border-color:${COLOR_MINT.vibrantMint}; font-weight:700;" onclick="confirmarTurnoRecepcionista(${idPaciente})">Confirmar Turno</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function confirmarTurnoRecepcionista(idPaciente) {
  const idMedico = document.getElementById('modal-medico').value;
  const fecha    = document.getElementById('modal-fecha').value;
  const hora     = document.getElementById('modal-hora').value;

  if (!idMedico || !fecha || !hora) { notificar('Completá todos los campos.', 'error'); return; }

  const respuesta = await api.crearTurnoRecepcionista({ idPaciente, idMedico, fecha, hora });
  if (!respuesta.success) { notificar('❌ ' + respuesta.error, 'error'); return; }

  document.getElementById('modal-turno-recep').remove();
  notificar('✅ Turno agendado correctamente.');

  const resTurnos = await api.getTurnos();
  if (resTurnos.success) estado.turnos = resTurnos.data;
}

// ── CREAR RECEPCIONISTA (solo Admin) ─────────────────────────────────────

function abrirFormCrearRecepcionista() {
  const modal = document.createElement('div');
  modal.id = 'modal-recep';
  modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999;`;
  modal.innerHTML = `
    <div style="background:white; border-radius:12px; padding:32px; max-width:420px; width:90%; box-shadow:0 20px 40px rgba(0,0,0,0.2);">
      <h3 style="color:${COLOR_MINT.emeraldDark}; font-weight:700; margin-bottom:20px;">➕ Nuevo Recepcionista</h3>
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div>
          <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size:13px;">Correo electrónico</label>
          <input id="recep-email" class="input" style="border:1px solid ${COLOR_MINT.mintLight}; background:white; color:#333; width:100%; margin-top:4px;" placeholder="Ej: recep@hospital.com" />
        </div>
        <div>
          <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size:13px;">Contraseña inicial</label>
          <input id="recep-pass" type="password" class="input" style="border:1px solid ${COLOR_MINT.mintLight}; background:white; color:#333; width:100%; margin-top:4px;" placeholder="Mínimo 4 caracteres" />
        </div>
      </div>
      <div style="display:flex; gap:10px; margin-top:24px;">
        <button class="btn btn-ghost" style="flex:1; border:1px solid ${COLOR_MINT.mintLight}; color:${COLOR_MINT.lightGray};" onclick="document.getElementById('modal-recep').remove()">Cancelar</button>
        <button class="btn btn-primary" style="flex:2; background-color:#7c3aed; border-color:#7c3aed; font-weight:700; color:white;" onclick="guardarRecepcionista()">Crear Cuenta</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function guardarRecepcionista() {
  const email    = document.getElementById('recep-email').value.trim();
  const password = document.getElementById('recep-pass').value;
  if (!email || !password) { notificar('Completá email y contraseña.', 'error'); return; }
  if (password.length < 4) { notificar('La contraseña debe tener al menos 4 caracteres.', 'error'); return; }

  const respuesta = await api.crearRecepcionista({ email, password });
  if (!respuesta.success) { notificar('❌ ' + respuesta.error, 'error'); return; }

  document.getElementById('modal-recep').remove();
  notificar('✅ Cuenta de recepcionista creada.');
  const datosNuevos = await api.getUsuarios();
  if (datosNuevos.success) estado.usuarios = datosNuevos.data;
  renderUsuarios();
}