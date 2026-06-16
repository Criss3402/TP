async function cambiarEstadoTurno(id, est) { 

  const respuesta = await api.cambiarEstado(id, est); 

  if (respuesta.success) {
    if (est === 'Ausente') {
      const turno = estado.turnos.find(t => t.id === id);
      if (turno) {
        // Buscar el paciente por id directamente desde los turnos en Supabase
        const { data: turnoData } = await clienteSupabase
          .from('turnos')
          .select('id_paciente')
          .eq('id_turno', id)
          .single();

        if (turnoData?.id_paciente) {
          const resAus = await api.registrarAusencia(turnoData.id_paciente);
          if (resAus.suspendido) {
            notificar(`⚠️ Paciente suspendido automáticamente por 3 inasistencias.`);
          } else {
            notificar(`✅ Ausencia registrada. Total: ${resAus.cantidad}/3`);
          }
        }
      }
    } else {
      notificar('✅ Turno actualizado a: ' + est);
    }

    const resTurnos = await api.getTurnos();
    if (resTurnos.success) {
      estado.turnos = resTurnos.data;
      renderMisTurnos();
    }
  } else {
    notificar('❌ ' + respuesta.error, 'error');
  }
}

async function guardarAgendaDoctor() {
  const dia       = document.getElementById('doc-agenda-dia').value;
  const inicio    = document.getElementById('doc-agenda-inicio').value;
  const fin       = document.getElementById('doc-agenda-fin').value;
  const duracion  = parseInt(document.getElementById('doc-duracion').value);

  if (!dia || !inicio || !fin) { notificar('Completá todos los campos.', 'error'); return; }
  if (inicio >= fin) { notificar('La hora de inicio debe ser anterior a la de fin.', 'error'); return; }

  const respuesta = await api.crearAgenda({
    doctorId: estado.usuario.id,
    diaSemana: parseInt(dia),
    horaInicio: inicio,
    horaFin: fin,
    duracionMinutos: duracion
  });

  if (!respuesta.success) { notificar('❌ ' + respuesta.error, 'error'); return; }
  notificar('✅ Horario guardado.');
  const resAgendas = await api.getAgendas();
  if (resAgendas.success) estado.agendas = resAgendas.data;
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

async function guardarLimiteTurnos() {
  const limite = parseInt(document.getElementById('doc-limite').value);
  if (!limite || limite < 1) { notificar('Ingresá un límite válido.', 'error'); return; }

  const { error } = await clienteSupabase
    .from('medicos')
    .update({ limite_turnos_dia: limite })
    .eq('id_medico', estado.usuario.id);

  if (error) { notificar('❌ No se pudo guardar el límite.', 'error'); return; }

  estado.usuario.limiteTurnosDia = limite;
  notificar(`✅ Límite actualizado a ${limite} turnos por día.`);
}