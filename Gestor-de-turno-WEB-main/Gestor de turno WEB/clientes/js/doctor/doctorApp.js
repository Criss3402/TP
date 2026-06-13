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
function abrirAtencionTurno(idTurno) {
  const turno = estado.turnos.find(t => t.id === idTurno);
  if (!turno) return;

  const modal = document.createElement('div');
  modal.id = 'modal-atencion';
  modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999;`;
  modal.innerHTML = `
    <div style="background:white; border-radius:12px; padding:32px; max-width:500px; width:90%; box-shadow:0 20px 40px rgba(0,0,0,0.2);">
      <h3 style="color:${COLOR_MINT.emeraldDark}; font-weight:700; margin-bottom:4px;">🩺 Registrar Atención</h3>
      <p style="color:${COLOR_MINT.lightGray}; font-size:13px; margin-bottom:20px;">Paciente: <strong>${turno.pacienteNombre}</strong> — ${turno.fecha} ${turno.hora}hs</p>
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div>
          <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size:13px;">Diagnóstico</label>
          <textarea id="modal-diagnostico" style="width:100%; margin-top:4px; padding:10px; border:1px solid ${COLOR_MINT.mintLight}; border-radius:6px; font-size:13px; color:#333; resize:vertical; min-height:100px;" placeholder="Describí el diagnóstico o las observaciones de la consulta..."></textarea>
        </div>
        <div>
          <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size:13px;">Indicaciones / Receta <span style="font-weight:400; color:${COLOR_MINT.lightGray};">(opcional)</span></label>
          <textarea id="modal-indicaciones" style="width:100%; margin-top:4px; padding:10px; border:1px solid ${COLOR_MINT.mintLight}; border-radius:6px; font-size:13px; color:#333; resize:vertical; min-height:60px;" placeholder="Medicación, estudios, indicaciones generales..."></textarea>
        </div>
      </div>
      <div style="display:flex; gap:10px; margin-top:24px;">
        <button class="btn btn-ghost" style="flex:1; border:1px solid ${COLOR_MINT.mintLight}; color:${COLOR_MINT.lightGray};" onclick="document.getElementById('modal-atencion').remove()">Cancelar</button>
        <button class="btn btn-primary" style="flex:2; background-color:${COLOR_MINT.vibrantMint}; border-color:${COLOR_MINT.vibrantMint}; font-weight:700;" onclick="confirmarAtencion(${idTurno})">Confirmar Atención</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function confirmarAtencion(idTurno) {
  const diagnostico   = document.getElementById('modal-diagnostico').value.trim();
  const indicaciones  = document.getElementById('modal-indicaciones').value.trim();

  if (!diagnostico) { notificar('Ingresá un diagnóstico antes de confirmar.', 'error'); return; }

  const respuesta = await api.cambiarEstado(idTurno, 'Atendido', diagnostico, indicaciones);
  if (!respuesta.success) { notificar('❌ ' + respuesta.error, 'error'); return; }

  document.getElementById('modal-atencion').remove();
  notificar('✅ Atención registrada correctamente.');
  const resTurnos = await api.getTurnos();
  if (resTurnos.success) estado.turnos = resTurnos.data;
  renderMisTurnos();
}