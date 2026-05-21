function renderNuevoTurno() {
  const { paso, especialidadId, doctorId } = estado.nuevoTurno;
  let contenido = '';

  if (paso === 1) {
    contenido = `<div class="grid-branches">${estado.especialidades.map(e => `<div class="branch-card" style="border-left:5px solid ${e.color}" onclick="seleccionarEspecialidad(${e.id})"><span style="font-size:30px">${e.icono}</span><div><div style="font-weight:700;color:${e.color};font-size:15px">${e.nombre}</div></div></div>`).join('')}</div>`;
  }
  
  else if (paso === 2) {
    const esp = estado.especialidades.find(e => e.id == especialidadId);
    const medicosFiltrados = estado.usuarios.filter(u => u.rol === 'DOCTOR' && u.especialidadId == especialidadId);

    const listaMedicosHTML = medicosFiltrados.map(m => `
      <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:15px; border-left: 3px solid #0ea5e9;">
        <div><span style="font-size:20px; margin-right:10px;">🩺</span><strong>${m.nombreCompleto}</strong></div>
        <button class="btn btn-primary" onclick="seleccionarDoctor(${m.id})">Ver Calendario</button>
      </div>
    `).join('');

    contenido = `
      <div class="card" style="max-width:650px;">
        <h3 style="margin-bottom:16px; color:${esp.color}">Especialistas en ${esp.nombre}</h3>
        <div style="margin-top:15px;">${listaMedicosHTML || '<p style="color:var(--text-muted);">No hay médicos disponibles para esta especialidad.</p>'}</div>
        <button class="btn btn-ghost" style="margin-top:15px;" onclick="irPasoTurno(1)">Volver</button>
      </div>
    `;
  }
  
  else if (paso === 3) {
    const esp = estado.especialidades.find(e => e.id == especialidadId);
    const doc = estado.usuarios.find(u => u.id == doctorId);
    const { mesActual, anioActual } = estado.calendario;
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const primerDia = new Date(anioActual, mesActual, 1).getDay();
    const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
    let offset = primerDia === 0 ? 6 : primerDia - 1;

    let celdas = '';
    for (let i = 0; i < offset; i++) celdas += `<div class="cal-day empty"></div>`;

    const agendasDelDoc = estado.agendas.filter(a => a.doctorId == doctorId);

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaFmt = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const diaDeLaSemana = new Date(anioActual, mesActual, dia).getDay();
      
      const turnosDia = agendasDelDoc.filter(a => a.diaSemana === diaDeLaSemana);
      const turnosBtn = turnosDia.map(t => `<div class="turno-btn" onclick="seleccionarTurnoCalendario('${fechaFmt}', '${t.horaInicio}')">🕖 ${t.horaInicio}</div>`).join('');
      
      celdas += `<div class="cal-day"><div class="cal-num">${dia}</div>${turnosBtn}</div>`;
    }

    contenido = `
      <style>
        .pink-cal-wrapper { font-family: sans-serif; background: #fffdfef; border: 1px solid #707070; margin-top: 10px; border-radius: 8px; overflow: hidden; }
        .cal-header-row { display: grid; grid-template-columns: repeat(7, 1fr); background: var(--bg-deep); text-align: center; font-weight: 700; font-size: 12px; border-bottom: 1px solid #707070; }
        .cal-header-row div { padding: 10px 0; border-right: 1px solid #707070; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); background: #444; gap: 1px; }
        .cal-day { background: var(--bg-card); min-height: 90px; padding: 6px; display: flex; flex-direction: column; gap: 5px; }
        .cal-day.empty { background: #2a2a2a; }
        .cal-num { font-weight: 700; color: var(--text-muted); font-size: 14px; text-align: left; }
        .turno-btn { background: #0ea5e9; color: white; text-align: center; padding: 4px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px; }
        .turno-btn:hover { background: #0284c7; }
      </style>
      <div class="card" style="max-width:800px; width: 100%;">
        <h3 style="margin-bottom:5px;">${esp.icono} Turnos con ${doc.nombreCompleto}</h3>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <button class="btn btn-ghost" onclick="cambiarMesTurnosPaciente(-1)">◀ Anterior</button>
          <h4 style="margin:0; font-size:18px;">${nombresMeses[mesActual]} ${anioActual}</h4>
          <button class="btn btn-ghost" onclick="cambiarMesTurnosPaciente(1)">Siguiente ▶</button>
        </div>

        <div class="pink-cal-wrapper">
          <div class="cal-header-row"><div>LUN</div><div>MAR</div><div>MIE</div><div>JUE</div><div>VIE</div><div>SAB</div><div>DOM</div></div>
          <div class="cal-grid">${celdas}</div>
        </div>
        <button class="btn btn-ghost" style="margin-top:20px;" onclick="irPasoTurno(2)">Volver a Médicos</button>
      </div>
    `; 
  }
  
  else if (paso === 4) {
    const esp = estado.especialidades.find(e => e.id == especialidadId);
    const doc = estado.usuarios.find(u => u.id == doctorId);
    contenido = `
      <div class="card" style="max-width:480px; border-left: 4px solid #059669;">
        <h3 style="font-weight:700; margin-bottom:16px">Resumen del Turno</h3>
        <p style="margin-bottom:8px;"><strong>Especialidad:</strong> ${esp.nombre}</p>
        <p style="margin-bottom:8px;"><strong>Profesional:</strong> ${doc.nombreCompleto}</p>
        <p style="margin-bottom:8px;"><strong>Fecha pautada:</strong> ${estado.nuevoTurno.fecha}</p>
        <p style="margin-bottom:8px;"><strong>Horario de cita:</strong> ${estado.nuevoTurno.hora} hs</p>
        <div style="display:flex; gap:10px; margin-top:25px">
          <button class="btn btn-ghost" onclick="irPasoTurno(3)">Atrás</button>
          <button class="btn btn-success" style="flex:1" onclick="confirmarTurno()">✅ Confirmar y Solicitar</button>
        </div>
      </div>
    `;
  }

  renderizar(`<div id="app-layout">${htmlSidebar('nuevo_turno')}<div id="main-content" class="fade-in"><h1 class="page-title">Pedir Turno Médico</h1><div style="margin-bottom:20px; color:var(--text-muted); font-size:14px;">Progreso: Paso ${paso} de 4</div>${contenido}</div></div>`);
}

function renderHistorial() {
  renderizar(`
      <div id="app-layout">${htmlSidebar('historial')}<div id="main-content" class="fade-in">
          <div style="display:flex; justify-content:space-between; align-items:center;">
              <h1 class="page-title">Mi Historial Médico</h1>
              <button class="btn btn-ghost" onclick="window.print()">🖨️ Imprimir Historial</button>
          </div>
          <div class="card" style="margin-top:20px">
              <div class="table-wrapper">
                  <table>
                      <thead><tr><th>Fecha</th><th>Especialidad</th><th>Médico</th><th>Diagnóstico</th><th>Archivos Adjuntos</th></tr></thead>
                      <tbody><tr><td colspan="5" style="text-align:center;">No hay registros médicos aún.</td></tr></tbody>
                  </table>
              </div>
          </div>
      </div></div>
  `);
}