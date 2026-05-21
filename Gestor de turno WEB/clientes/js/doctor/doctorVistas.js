function renderMisTurnos(seccion) {
  const turnosPermitidos = filtrarTurnosPorRol(estado.turnos, estado.usuario);
  const filas = turnosPermitidos.map(t => `<tr><td><strong>${t.codigoTurno}</strong></td><td><span style="color:${colorEspecialidad(t.especialidadId)};font-weight:600">${nombreEspecialidad(t.especialidadId)}</span></td>${!esPaciente ? `<td>${t.pacienteNombre}</td>` : ''}<td>${t.fecha}</td><td>${t.hora}</td><td>${badgeEstado(t.estado)}</td>${!esPaciente ? `<td>${t.estado === 'PENDIENTE' ? `<button class="btn btn-small" style="background:#0d9488;color:#fff" onclick="cambiarEstadoTurno(${t.id},'EN_CURSO')">Llamar</button>` : ''}${t.estado === 'EN_CURSO' ? `<button class="btn btn-small btn-success" onclick="cambiarEstadoTurno(${t.id},'COMPLETADO')">Completar</button>` : ''}</td>` : ''}</tr>`).join('');
  renderizar(`<div id="app-layout">${htmlSidebar(seccion || 'mis_turnos')}<div id="main-content" class="fade-in"><h1 class="page-title">${esPaciente ? 'Mis Turnos' : 'Turnos Registrados'}</h1><div class="table-wrapper" style="margin-top:20px"><table><thead><tr><th>Código</th><th>Especialidad</th>${!esPaciente ? '<th>Paciente</th>' : ''}<th>Fecha</th><th>Hora</th><th>Estado</th>${!esPaciente ? '<th>Acciones</th>' : ''}</tr></thead><tbody>${filas || '<tr><td colspan="7" style="text-align:center;padding:20px">No hay turnos</td></tr>'}</tbody></table></div></div></div>`);
}
// Vista para Registrar la Atención de Consulta [cite: 54]
function renderAtencionTurno(turnoId) {
    // Aquí cargarías los datos del turno específico
    renderizar(`
        <div id="app-layout">${htmlSidebar('mis_turnos')}<div id="main-content" class="fade-in">
            <h1 class="page-title">Registrar Atención de Consulta</h1>
            <div class="card" style="max-width: 800px; margin-top:20px">
                <h3 style="margin-bottom:15px">Datos Médicos</h3>
                <div class="field"><label>Diagnóstico / Observaciones</label>
                    <textarea class="input" style="height: 100px;" placeholder="Ingrese el diagnóstico y las indicaciones..."></textarea>
                </div>
                <div class="field"><label>Adjuntar Documentos (Recetas, Estudios)</label> <input type="file" class="input" />
                </div>
                <div style="display:flex; gap:10px; margin-top: 20px;">
                    <button class="btn btn-success" style="flex:1" onclick="notificar('Atención registrada con éxito'); navegarA('mis_turnos')">💾 Guardar Registro</button>
                    <button class="btn btn-danger" onclick="notificar('Inasistencia registrada'); navegarA('mis_turnos')">🚫 Marcar Inasistencia</button> </div>
            </div>
        </div></div>
    `);
}
function renderMiAgendaDoctor() {
  const { mesActual, anioActual } = estado.calendario;
  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const primerDia = new Date(anioActual, mesActual, 1).getDay();
  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
  let offsetCeldasVacias = primerDia === 0 ? 6 : primerDia - 1; 

  let celdasHTML = '';
  for (let i = 0; i < offsetCeldasVacias; i++) celdasHTML += `<div class="cal-day empty"></div>`;

  // El médico solo ve SUS propios horarios recurrentes cargados
  const misHorarios = estado.agendas.filter(a => a.doctorId == estado.usuario.id);

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const diaDeLaSemana = new Date(anioActual, mesActual, dia).getDay();
    const eventosDia = misHorarios.filter(a => a.diaSemana === diaDeLaSemana);
    
    const eventosHTML = eventosDia.map(e => `
      <div class="cal-event" onclick="borrarAgendaDoctor(${e.id})" title="Click para eliminar este horario">
        🟢 ${e.horaInicio} - ${e.horaFin}
      </div>
    `).join('');
    
    celdasHTML += `<div class="cal-day"><div class="cal-num">${dia}</div>${eventosHTML}</div>`;
  }

  // AGREGAMOS LOS ESTILOS QUE FALTABAN PARA ARMAR LA GRILLA
  const estilosCalendario = `
    <style>
      .pink-cal-wrapper { font-family: sans-serif; background: #fffdfef; border: 1px solid #707070; margin-top: 20px; }
      .cal-header-row { display: grid; grid-template-columns: repeat(7, 1fr); background: #fdf2f8; color: #831843; text-align: center; font-weight: 700; font-size: 13px; border-bottom: 1px solid #707070; text-transform: uppercase; letter-spacing: 1px;}
      .cal-header-row div { padding: 12px 0; border-right: 1px solid #707070; }
      .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); background: #cfcfcf; gap: 1px; }
      .cal-day { background: #fffdfef; min-height: 120px; padding: 6px; display: flex; flex-direction: column; gap: 4px; }
      .cal-day.empty { background: #585858; }
      .cal-num { font-weight: 700; color: #333; font-size: 13px; margin-bottom: 4px; text-align: left;}
      .cal-event { background: var(--accent); color: #fff; font-size: 11px; padding: 4px 6px; border-radius: 4px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .cal-event:hover { opacity: 0.8; }
    </style>
  `;

  renderizar(`
    ${estilosCalendario} <div id="app-layout">${htmlSidebar('mi_agenda_doc')}<div id="main-content" class="fade-in">
      <h1 class="page-title">Configurar Mis Horarios de Atención</h1>
      <div class="card" style="margin-bottom: 24px;">
        <h3 style="font-weight:700; margin-bottom: 16px;">📆 Agregar Día Recurrente</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end;">
          
          <div class="field" style="width: 180px; margin-bottom: 0;">
            <label>Día de la semana</label>
            <select id="doc-agenda-dia" class="input">
              <option value="">Seleccionar día...</option>
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miércoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
              <option value="6">Sábado</option>
              <option value="0">Domingo</option>
            </select>
          </div>

          <div class="field" style="width: 110px; margin-bottom: 0;">
            <label>Hora Entrada</label>
            <input id="doc-agenda-inicio" type="time" class="input" />
          </div>
          
          <div class="field" style="width: 110px; margin-bottom: 0;">
            <label>Hora Salida</label>
            <input id="doc-agenda-fin" type="time" class="input" />
          </div>
          
          <button class="btn btn-primary" style="height: 38px;" onclick="guardarAgendaDoctor()">Establecer Horario</button>
        </div>
      </div>
      
      <div style="display:flex; align-items:center; justify-content:center; gap: 20px; margin-top: 30px;">
        <button class="btn btn-ghost" onclick="cambiarMes(-1); renderMiAgendaDoctor();">◀ Mes Anterior</button>
        <h2 style="font-size: 24px; font-weight: 700; width: 250px; text-align:center;">${nombresMeses[mesActual]} ${anioActual}</h2>
        <button class="btn btn-ghost" onclick="cambiarMes(1); renderMiAgendaDoctor();">Mes Siguiente ▶</button>
      </div>
      
      <div class="pink-cal-wrapper">
        <div class="cal-header-row"><div>LUNES</div><div>MARTES</div><div>MIÉRCOLES</div><div>JUEVES</div><div>VIERNES</div><div>SÁBADO</div><div>DOMINGO</div></div>
        <div class="cal-grid">${celdasHTML}</div>
      </div>
    </div></div>
  `);
}