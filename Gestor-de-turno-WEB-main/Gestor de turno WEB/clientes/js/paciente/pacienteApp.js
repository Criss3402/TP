async function seleccionarEspecialidad(id) {
  const resPac = await api.getPacientePorUsuario(estado.usuario.id);
  if (resPac.success && resPac.data?.estado_suspension) {
    notificar('⚠️ Tu cuenta está suspendida. No podés pedir turnos.', 'error');
    return;
  }
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
    
   // 4. Si se guardó, descargamos la lista de turnos y pagos frescos para que aparezca
    const resTurnos = await api.getTurnos();
    if (resTurnos.success) {
        estado.turnos = resTurnos.data;
    }
    const resPagos = await api.getPagos();
    if (resPagos.success) {
        estado.pagos = resPagos.data;
    }

    // 5. Enviar email de confirmación al paciente (en segundo plano)
    try {
      const esp = estado.especialidades.find(e => e.id == estado.nuevoTurno.especialidadId);
      const doc = estado.usuarios.find(u => u.id == estado.nuevoTurno.doctorId);
      emailService.enviarConfirmacionTurno({
        to_email:     estado.usuario.username,
        to_name:      estado.usuario.nombreCompleto,
        especialidad: esp ? esp.nombre : 'General',
        doctor:       doc ? doc.nombreCompleto : 'Sin asignar',
        fecha:        estado.nuevoTurno.fecha,
        hora:         estado.nuevoTurno.hora,
        turno_id:     resTurnos.data?.length ? resTurnos.data[resTurnos.data.length - 1].id : 0
      }).then(res => {
        if (res.success) notificar('📧 Te enviamos un email de confirmación.');
      });
    } catch (e) {
      console.warn('No se pudo enviar email de confirmación:', e);
    }

    // 6. Limpiamos la memoria temporal y lo mandamos a su panel de turnos
    estado.nuevoTurno = { paso: 1, especialidadId: null, doctorId: null, fecha: '', hora: '' };
    navegarA('mis_turnos');
    
  } else {
    notificar('❌ Error: ' + respuesta.error, 'error');
  }
}
async function cancelarTurnoPaciente(id) {
  if (!confirm('¿Cancelar este turno?')) return;
  const respuesta = await api.cambiarEstado(id, 'Cancelado');
  if (!respuesta.success) { notificar('❌ ' + respuesta.error, 'error'); return; }
  notificar('✅ Turno cancelado.');
  const resTurnos = await api.getTurnos();
  if (resTurnos.success) estado.turnos = resTurnos.data;
  renderMisTurnos();
}

function filtrarEspecialidades(texto) {
  const cards = document.querySelectorAll('#lista-especialidades .branch-card');
  const filtro = texto.toLowerCase().trim();
  cards.forEach(card => {
    const nombre = card.dataset.nombre || '';
    card.style.display = nombre.includes(filtro) ? '' : 'none';
  });
}

function abrirModalConfirmacion() {
  const { especialidadId, doctorId, fecha, hora } = estado.nuevoTurno;
  const esp = estado.especialidades.find(e => e.id == especialidadId);
  const doc = estado.usuarios.find(u => u.id == doctorId);

  const modal = document.createElement('div');
  modal.id = 'modal-confirm-turno';
  modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999;`;
  modal.innerHTML = `
    <div style="background:white; border-radius:12px; padding:32px; max-width:440px; width:90%; box-shadow:0 20px 40px rgba(0,0,0,0.2); text-align:center;">
      <div style="font-size:48px; margin-bottom:16px;">📅</div>
      <h3 style="color:${COLOR_MINT.emeraldDark}; font-weight:700; margin:0 0 8px 0; font-size:20px;">¿Confirmar turno?</h3>
      <p style="color:${COLOR_MINT.lightGray}; font-size:14px; margin-bottom:24px;">Estás por solicitar el siguiente turno médico</p>
      <div style="background:${COLOR_MINT.bgTint}; border-radius:8px; padding:16px; margin-bottom:24px; text-align:left;">
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; gap:8px;">
            <span style="color:${COLOR_MINT.emeraldDark}; font-weight:700; font-size:13px; min-width:110px;">Especialidad:</span>
            <span style="color:#333; font-size:13px;">${esp ? esp.nombre : '—'}</span>
          </div>
          <div style="display:flex; gap:8px;">
            <span style="color:${COLOR_MINT.emeraldDark}; font-weight:700; font-size:13px; min-width:110px;">Profesional:</span>
            <span style="color:#333; font-size:13px;">${doc ? doc.nombreCompleto : '—'}</span>
          </div>
          <div style="display:flex; gap:8px;">
            <span style="color:${COLOR_MINT.emeraldDark}; font-weight:700; font-size:13px; min-width:110px;">Fecha:</span>
            <span style="color:#333; font-size:13px;">${fecha}</span>
          </div>
          <div style="display:flex; gap:8px;">
            <span style="color:${COLOR_MINT.emeraldDark}; font-weight:700; font-size:13px; min-width:110px;">Horario:</span>
            <span style="color:#333; font-size:13px;">${hora} hs</span>
          </div>
        </div>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-ghost" style="flex:1; border:1px solid ${COLOR_MINT.mintLight}; color:${COLOR_MINT.lightGray};" onclick="document.getElementById('modal-confirm-turno').remove()">Cancelar</button>
        <button class="btn btn-primary" style="flex:2; background-color:${COLOR_MINT.vibrantMint}; border-color:${COLOR_MINT.vibrantMint}; font-weight:700;" onclick="confirmarTurnoDesdeModal()">✅ Confirmar Turno</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function confirmarTurnoDesdeModal() {
  document.getElementById('modal-confirm-turno').remove();
  await confirmarTurno();
}

function abrirModalPago(idTurno) {
  const modal = document.createElement('div');
  modal.id = 'modal-pago';
  modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999;`;
  modal.innerHTML = `
    <div style="background:white; border-radius:12px; padding:32px; max-width:420px; width:90%; box-shadow:0 20px 40px rgba(0,0,0,0.2); text-align:center;">
      <div style="font-size:42px; margin-bottom:12px;">💳</div>
      <h3 style="color:${COLOR_MINT.emeraldDark}; font-weight:700; margin:0 0 8px 0; font-size:20px;">Pagar Turno</h3>
      <p style="color:${COLOR_MINT.lightGray}; font-size:14px; margin-bottom:20px;">Monto a pagar: <strong style="color:${COLOR_MINT.coral}; font-size:18px;">$5.000</strong></p>
      <div style="text-align:left; margin-bottom:24px;">
        <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size:13px;">Método de pago</label>
        <select id="modal-metodo-pago" class="input" style="border:1px solid ${COLOR_MINT.mintLight}; background:white; color:#333; width:100%; margin-top:6px;">
          <option value="Efectivo">💵 Efectivo</option>
          <option value="Tarjeta">💳 Tarjeta de crédito/débito</option>
          <option value="Transferencia">🏦 Transferencia bancaria</option>
        </select>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-ghost" style="flex:1; border:1px solid ${COLOR_MINT.mintLight}; color:${COLOR_MINT.lightGray};" onclick="document.getElementById('modal-pago').remove()">Cancelar</button>
        <button class="btn btn-primary" style="flex:2; background-color:${COLOR_MINT.coral}; border-color:${COLOR_MINT.coral}; font-weight:700;" onclick="confirmarPago(${idTurno})">Confirmar Pago</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function confirmarPago(idTurno) {
  const metodo = document.getElementById('modal-metodo-pago').value;
  const respuesta = await api.pagarTurno(idTurno, metodo);
  if (!respuesta.success) { notificar('❌ ' + respuesta.error, 'error'); return; }

  document.getElementById('modal-pago').remove();
  notificar('✅ Pago registrado correctamente.');

  const resPagos = await api.getPagos();
  if (resPagos.success) estado.pagos = resPagos.data;
  renderMisTurnos();
}