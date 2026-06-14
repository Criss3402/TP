// --- Controladores Usuarios del Sistema ---

function abrirFormEditarUsuario(id) {
  const usr = estado.usuarios.find(u => u.id === id);
  if (!usr) return;
  document.getElementById('usr-sys-titulo').innerText = '✏️ Editando: ' + usr.nombreCompleto;
  document.getElementById('usr-sys-id').value      = usr.id;
  const partes = usr.nombreCompleto.split(' ');
  document.getElementById('usr-sys-nombre').value  = partes[0] || '';
  document.getElementById('usr-sys-apellido').value= partes.slice(1).join(' ') || '';
  document.getElementById('usr-sys-dni').value     = usr.dni || '';
  document.getElementById('usr-sys-tel').value     = usr.telefono || '';
  document.getElementById('usr-sys-email').value   = usr.username;
  document.getElementById('usr-sys-rol').value     = usr.rol === 'DOCTOR' ? 'medico' : usr.rol.toLowerCase();
  document.getElementById('usr-sys-pass').value    = '';
}

async function guardarUsuarioSistema() {
  const id       = document.getElementById('usr-sys-id').value;
  const nombre   = document.getElementById('usr-sys-nombre').value.trim();
  const apellido = document.getElementById('usr-sys-apellido').value.trim();
  const dni      = document.getElementById('usr-sys-dni').value.trim();
  const telefono = document.getElementById('usr-sys-tel').value.trim();
  const email    = document.getElementById('usr-sys-email').value.trim();
  const rol      = document.getElementById('usr-sys-rol').value;
  const password = document.getElementById('usr-sys-pass').value;

  if (!nombre || !apellido || !dni || !email || !rol) {
    notificar('Completá nombre, apellido, DNI, email y rol.', 'error');
    return;
  }

  if (id) {
    const datos = { email, rol, nombre, apellido, dni, telefono };
    if (password) datos.password = password;
    const r = await api.actualizarUsuarioGenerico(id, datos);
    if (!r.success) { notificar('❌ ' + r.error, 'error'); return; }
    notificar('✅ Usuario actualizado.');
  } else {
    if (!password || password.length < 4) {
      notificar('Ingresá una contraseña de al menos 4 caracteres.', 'error');
      return;
    }
    const r = await api.crearUsuarioGenerico(email, password, rol, nombre, apellido, dni, telefono);
    if (!r.success) { notificar('❌ ' + r.error, 'error'); return; }
    notificar('✅ Usuario creado.');
  }

  const res = await api.getUsuarios();
  if (res.success) estado.usuarios = res.data;
  renderUsuarios();
}

async function eliminarUsuarioSistema(id, nombre) {
  if (!confirm(`¿Eliminar al usuario ${nombre}? Esta acción no se puede deshacer.`)) return;
  const r = await api.eliminarUsuarioGenerico(id);
  if (!r.success) { notificar('❌ ' + r.error, 'error'); return; }
  notificar('🗑️ Usuario eliminado.');
  const res = await api.getUsuarios();
  if (res.success) estado.usuarios = res.data;
  renderUsuarios();
}

async function guardarNuevaEspecialidad() {
  const nombre = document.getElementById('esp-nombre').value.trim();
  const color = document.getElementById('esp-color').value;
  
  if (!nombre) { notificar('Ingresá el nombre', 'error'); return; }

  const respuesta = await api.crearEspecialidad(nombre, color);
  
  if (respuesta.success) {
    notificar('✅ Especialidad guardada con su color');
    const resEsp = await api.getEspecialidades();
    if (resEsp.success) estado.especialidades = resEsp.data;
    renderEspecialidades();
  } else {
    notificar('❌ ' + respuesta.error, 'error');
  }
}

async function borrarEspecialidad(id) {
  if (!confirm('¿Eliminar especialidad de la base de datos?')) return;
  
  const respuesta = await api.borrarEspecialidad(id);
  
  if (respuesta.success) {
    notificar('🗑️ Especialidad eliminada de la nube');
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

async function guardarAgenda() {
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

  const respuesta = await api.crearAgenda({
    doctorId: parseInt(doctorId),
    diaSemana: parseInt(diaSemana),
    horaInicio,
    horaFin
  });

  if (!respuesta.success) { notificar('❌ ' + respuesta.error, 'error'); return; }

  notificar('✅ Horario guardado en la base de datos');
  const resAgendas = await api.getAgendas();
  if (resAgendas.success) estado.agendas = resAgendas.data;
  renderAgenda();
}

async function borrarAgenda(id) {
  if (!confirm('¿Eliminar horario del calendario?')) return;

  const respuesta = await api.borrarAgenda(id);
  if (!respuesta.success) { notificar('❌ ' + respuesta.error, 'error'); return; }

  notificar('🗑️ Horario eliminado de la base de datos');
  const resAgendas = await api.getAgendas();
  if (resAgendas.success) estado.agendas = resAgendas.data;
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
    const r1 = await api.actualizarMedico(id, { nombre, apellido, dni, telefono, matricula, especialidadId: espId || null });
    const r2 = await api.actualizarEmailUsuario(id, email);
    if (!r1.success || !r2.success) { notificar('❌ Error al actualizar.', 'error'); return; }
    notificar('✅ Médico actualizado correctamente.');
  } else {
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
  renderGestionMedicos();
}

async function suspenderPacienteManual(idPaciente, nombre) {
  const motivo = prompt(`¿Motivo de suspensión para ${nombre}?`);
  if (!motivo) return;
  const r = await api.suspenderPaciente(idPaciente, motivo);
  if (!r.success) { notificar('❌ ' + r.error, 'error'); return; }
  notificar(`🚫 ${nombre} suspendido.`);
  renderGestionPacientes();
}

async function reactivarPaciente(idPaciente, nombre) {
  if (!confirm(`¿Reactivar la cuenta de ${nombre}?`)) return;
  const r = await api.reactivarPaciente(idPaciente);
  if (!r.success) { notificar('❌ ' + r.error, 'error'); return; }
  notificar(`✅ ${nombre} reactivado. Ausencias reiniciadas.`);
  renderGestionPacientes();
}

function buscarHistorialPaciente() {
  const idUsuario = document.getElementById('hist-paciente').value;
  if (!idUsuario) { notificar('Seleccioná un paciente.', 'error'); return; }

  const paciente = estado.usuarios.find(u => u.id == idUsuario);
  const nombrePaciente = paciente ? paciente.nombreCompleto : '';

  const registros = estado.turnos.filter(t => 
    t.pacienteNombre === nombrePaciente && t.estado === 'Atendido'
  );

  const filasHTML = registros.length === 0
    ? `<tr><td colspan="4" style="text-align:center; padding:30px; color:${COLOR_MINT.lightGray};">Este paciente no tiene registros médicos aún.</td></tr>`
    : registros.map(t => {
        const esp = estado.especialidades.find(e => e.id == t.especialidadId);
        return `
          <tr style="border-bottom:1px solid ${COLOR_MINT.mintLight}44;">
            <td style="padding:14px 12px;"><strong>${t.fecha}</strong></td>
            <td style="padding:14px 12px;">${esp ? esp.nombre : '—'}</td>
            <td style="padding:14px 12px;">${t.doctorNombre}</td>
            <td style="padding:14px 12px;">${t.diagnostico || 'Atención completada'}</td>
          </tr>
        `;
      }).join('');

  document.getElementById('resultado-historial').innerHTML = `
    <div class="card" style="background:white; border:1px solid ${COLOR_MINT.mintLight}; border-top:4px solid ${COLOR_MINT.emeraldDark}; border-radius:8px; padding:0; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.02);">
      <div style="padding:16px 20px; border-bottom:1px solid ${COLOR_MINT.mintLight}44;">
        <h3 style="margin:0; color:${COLOR_MINT.emeraldDark}; font-weight:700;">📋 Historial de ${nombrePaciente}</h3>
      </div>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background-color:${COLOR_MINT.emeraldDark}; color:white; text-align:left;">
            <th style="padding:14px 12px;">Fecha</th>
            <th style="padding:14px 12px;">Especialidad</th>
            <th style="padding:14px 12px;">Médico</th>
            <th style="padding:14px 12px;">Diagnóstico</th>
          </tr>
        </thead>
        <tbody>${filasHTML}</tbody>
      </table>
    </div>
  `;
}

function calcularEstadisticas(todo = false) {
  const desde = document.getElementById('est-desde').value;
  const hasta = document.getElementById('est-hasta').value;

  if (!todo && (!desde || !hasta)) {
    notificar('Seleccioná un rango de fechas o hacé click en "Ver Todo".', 'error');
    return;
  }

  let turnos = estado.turnos;
  if (!todo && desde && hasta) {
    turnos = turnos.filter(t => t.fecha >= desde && t.fecha <= hasta);
  }

  const totalTurnos     = turnos.length;
  const totalPacientes  = new Set(turnos.map(t => t.pacienteNombre)).size;
  const totalMedicos    = estado.usuarios.filter(u => u.rol === 'DOCTOR').length;

  // Conteo por estado
  const porEstado = {
    Solicitado: turnos.filter(t => t.estado === 'Solicitado').length,
    Confirmado: turnos.filter(t => t.estado === 'Confirmado').length,
    Atendido:   turnos.filter(t => t.estado === 'Atendido').length,
    Cancelado:  turnos.filter(t => t.estado === 'Cancelado').length,
    Ausente:    turnos.filter(t => t.estado === 'Ausente').length,
  };

  // Especialidad más demandada
  const porEsp = {};
  turnos.forEach(t => {
    const esp = estado.especialidades.find(e => e.id == t.especialidadId);
    const nombre = esp ? esp.nombre : 'Sin especialidad';
    porEsp[nombre] = (porEsp[nombre] || 0) + 1;
  });
  const espMasDemandada = Object.entries(porEsp).sort((a,b) => b[1]-a[1])[0];

  // Ranking médicos por atendidos
  const porMedico = {};
  turnos.filter(t => t.estado === 'Atendido').forEach(t => {
    porMedico[t.doctorNombre] = (porMedico[t.doctorNombre] || 0) + 1;
  });
  const rankingMedicos = Object.entries(porMedico).sort((a,b) => b[1]-a[1]);

  // Ranking especialidades
  const rankingEsp = Object.entries(porEsp).sort((a,b) => b[1]-a[1]);

  // Colores torta
  const coloresTorta = {
    Solicitado: '#f59e0b',
    Confirmado: '#3b82f6',
    Atendido:   '#10b981',
    Cancelado:  '#e63946',
    Ausente:    '#8b5cf6'
  };

  // Generar segmentos SVG torta
  const total = Object.values(porEstado).reduce((a,b) => a+b, 0);
  let svgTorta = '';
  if (total > 0) {
    let startAngle = 0;
    const cx = 120, cy = 120, r = 100;
    Object.entries(porEstado).forEach(([estado, count]) => {
      if (count === 0) return;
      const angle = (count / total) * 360;
      const endAngle = startAngle + angle;
      const x1 = cx + r * Math.cos((startAngle - 90) * Math.PI / 180);
      const y1 = cy + r * Math.sin((startAngle - 90) * Math.PI / 180);
      const x2 = cx + r * Math.cos((endAngle - 90) * Math.PI / 180);
      const y2 = cy + r * Math.sin((endAngle - 90) * Math.PI / 180);
      const largeArc = angle > 180 ? 1 : 0;
      svgTorta += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z" fill="${coloresTorta[estado]}" stroke="white" stroke-width="2"/>`;
      startAngle = endAngle;
    });
  } else {
    svgTorta = `<circle cx="120" cy="120" r="100" fill="#e5e7eb"/>`;
  }

  const leyendaTorta = Object.entries(porEstado).map(([est, count]) => `
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
      <div style="width:14px; height:14px; border-radius:3px; background:${coloresTorta[est]};"></div>
      <span style="font-size:13px; color:#333;">${est}: <strong>${count}</strong></span>
    </div>
  `).join('');

  const filasRankingMedicos = rankingMedicos.length === 0
    ? `<tr><td colspan="2" style="text-align:center; padding:20px; color:${COLOR_MINT.lightGray};">Sin datos</td></tr>`
    : rankingMedicos.map(([nombre, cant], i) => `
        <tr style="border-bottom:1px solid ${COLOR_MINT.mintLight}44;">
          <td style="padding:12px;">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`} ${nombre}</td>
          <td style="padding:12px; text-align:right; font-weight:700; color:${COLOR_MINT.vibrantMint};">${cant} atendidos</td>
        </tr>
      `).join('');

  const filasRankingEsp = rankingEsp.length === 0
    ? `<tr><td colspan="2" style="text-align:center; padding:20px; color:${COLOR_MINT.lightGray};">Sin datos</td></tr>`
    : rankingEsp.map(([nombre, cant]) => `
        <tr style="border-bottom:1px solid ${COLOR_MINT.mintLight}44;">
          <td style="padding:12px;">${nombre}</td>
          <td style="padding:12px; text-align:right; font-weight:700; color:${COLOR_MINT.emeraldDark};">${cant} turnos</td>
        </tr>
      `).join('');

  document.getElementById('resultado-estadisticas').innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px;">
      <div class="card" style="background:white; border-left:4px solid ${COLOR_MINT.vibrantMint}; box-shadow:0 4px 12px rgba(0,0,0,0.02);">
        <div style="font-size:32px; font-weight:800; color:${COLOR_MINT.vibrantMint};">${totalTurnos}</div>
        <div style="color:${COLOR_MINT.lightGray}; font-size:13px; margin-top:4px;">📋 Total de Turnos</div>
      </div>
      <div class="card" style="background:white; border-left:4px solid ${COLOR_MINT.waterGreen}; box-shadow:0 4px 12px rgba(0,0,0,0.02);">
        <div style="font-size:32px; font-weight:800; color:${COLOR_MINT.waterGreen};">${totalPacientes}</div>
        <div style="color:${COLOR_MINT.lightGray}; font-size:13px; margin-top:4px;">👥 Pacientes con Turnos</div>
      </div>
      <div class="card" style="background:white; border-left:4px solid ${COLOR_MINT.emeraldDark}; box-shadow:0 4px 12px rgba(0,0,0,0.02);">
        <div style="font-size:32px; font-weight:800; color:${COLOR_MINT.emeraldDark};">${totalMedicos}</div>
        <div style="color:${COLOR_MINT.lightGray}; font-size:13px; margin-top:4px;">👨‍⚕️ Médicos Activos</div>
      </div>
      <div class="card" style="background:white; border-left:4px solid #f59e0b; box-shadow:0 4px 12px rgba(0,0,0,0.02);">
        <div style="font-size:20px; font-weight:800; color:#f59e0b;">${espMasDemandada ? espMasDemandada[0] : '—'}</div>
        <div style="color:${COLOR_MINT.lightGray}; font-size:13px; margin-top:4px;">🏆 Especialidad más demandada</div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
      <div class="card" style="background:white; border:1px solid ${COLOR_MINT.mintLight}; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.02);">
        <h3 style="font-weight:700; color:${COLOR_MINT.emeraldDark}; margin-bottom:20px;">🥧 Distribución por Estado</h3>
        <div style="display:flex; align-items:center; gap:24px; flex-wrap:wrap;">
          <svg width="240" height="240" viewBox="0 0 240 240">${svgTorta}</svg>
          <div>${leyendaTorta}</div>
        </div>
      </div>

      <div class="card" style="background:white; border:1px solid ${COLOR_MINT.mintLight}; border-radius:8px; padding:0; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.02);">
        <div style="padding:16px 20px; border-bottom:1px solid ${COLOR_MINT.mintLight}44;">
          <h3 style="margin:0; font-weight:700; color:${COLOR_MINT.emeraldDark};">🏅 Ranking de Médicos</h3>
        </div>
        <table style="width:100%; border-collapse:collapse;">
          <thead><tr style="background:${COLOR_MINT.emeraldDark}; color:white; text-align:left;">
            <th style="padding:12px;">Médico</th>
            <th style="padding:12px; text-align:right;">Turnos Atendidos</th>
          </tr></thead>
          <tbody>${filasRankingMedicos}</tbody>
        </table>
      </div>
    </div>

    <div class="card" style="background:white; border:1px solid ${COLOR_MINT.mintLight}; border-radius:8px; padding:0; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.02);">
      <div style="padding:16px 20px; border-bottom:1px solid ${COLOR_MINT.mintLight}44;">
        <h3 style="margin:0; font-weight:700; color:${COLOR_MINT.emeraldDark};">🩺 Turnos por Especialidad</h3>
      </div>
      <table style="width:100%; border-collapse:collapse;">
        <thead><tr style="background:${COLOR_MINT.emeraldDark}; color:white; text-align:left;">
          <th style="padding:12px;">Especialidad</th>
          <th style="padding:12px; text-align:right;">Total Turnos</th>
        </tr></thead>
        <tbody>${filasRankingEsp}</tbody>
      </table>
    </div>
  `;
}