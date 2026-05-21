function renderUsuarios() {
  const filas = estado.usuarios.map(u => `<tr><td><strong>${u.nombreCompleto}</strong></td><td>@${u.username}</td><td>${badgeRol(u.rol)}</td><td>${u.especialidadId ? nombreEspecialidad(u.especialidadId) : '—'}</td><td style="text-align:right;">${u.rol === 'DOCTOR' ? `<button class="btn btn-ghost btn-small" onclick="editarEspecialista(${u.id})">✏️ Editar</button>` : ''}</td></tr>`).join('');
  const opcionesEsp = estado.especialidades.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');

  renderizar(`
    <div id="app-layout">${htmlSidebar('usuarios')}<div id="main-content" class="fade-in">
      <h1 class="page-title">Directorio de Usuarios y Especialistas</h1>
      <div class="card" style="margin-bottom: 24px; max-width: 800px; border-left: 3px solid var(--accent);">
        <h3 id="form-titulo" style="font-weight:700; margin-bottom: 16px;">👨‍⚕️ Agregar/Editar Especialista</h3><input type="hidden" id="usr-id" value="">
        <div style="display: flex; gap: 12px; align-items: flex-end; flex-wrap:wrap;">
          <div class="field" style="flex:1; min-width:200px; margin-bottom: 0;"><label>Nombre Completo</label><input id="usr-nombre" class="input" placeholder="Ej: Dr. Juan Pérez" /></div>
          <div class="field" style="flex:1; min-width:150px; margin-bottom: 0;"><label>Usuario</label><input id="usr-user" class="input" placeholder="Ej: doc.juan" /></div>
          <div class="field" style="flex:1; min-width:150px; margin-bottom: 0;"><label>Especialidad</label><select id="usr-esp" class="input"><option value="">Ninguna...</option>${opcionesEsp}</select></div>
          <button class="btn btn-primary" style="height: 38px;" onclick="guardarEspecialista()">Guardar</button>
          <button class="btn btn-ghost" style="height: 38px;" onclick="renderUsuarios()">Cancelar</button>
        </div>
      </div>
      <div class="table-wrapper"><table><thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Especialidad</th><th style="text-align:right;">Acción</th></tr></thead><tbody>${filas}</tbody></table></div>
    </div></div>
  `);
}

function renderEspecialidades() {
  const filas = estado.especialidades.map(e => `<tr><td style="font-size:24px; text-align:center;">${e.icono}</td><td><strong style="color:${e.color}">${e.nombre}</strong></td><td><span class="badge" style="background:${e.color}22;color:${e.color}; letter-spacing:1px;">${e.color}</span></td><td style="text-align:right;"><button class="btn btn-danger btn-small" onclick="borrarEspecialidad(${e.id})">🗑️ Eliminar</button></td></tr>`).join('');
  renderizar(`
    <div id="app-layout">${htmlSidebar('gestionar_esp')}<div id="main-content" class="fade-in">
      <h1 class="page-title">Gestión de Especialidades</h1>
      <div class="card" style="margin-bottom: 24px; max-width: 650px;">
        <h3 style="font-weight:700; margin-bottom: 16px;">➕ Nueva Especialidad</h3>
        <div style="display: flex; gap: 12px; align-items: flex-end;">
          <div class="field" style="flex:1; margin-bottom: 0;"><label>Nombre</label><input id="esp-nombre" class="input" placeholder="Ej: Odontología" /></div>
          <div class="field" style="width: 80px; margin-bottom: 0;"><label>Icono</label><input id="esp-icono" class="input" placeholder="🦷" /></div>
          <div class="field" style="width: 100px; margin-bottom: 0;"><label>Color</label><input id="esp-color" class="input" type="color" value="#3b82f6" style="padding: 2px; height: 38px;" /></div>
          <button class="btn btn-primary" style="height: 38px;" onclick="guardarNuevaEspecialidad()">Agregar</button>
        </div>
      </div>
      <div class="table-wrapper"><table><thead><tr><th style="width:70px;text-align:center;">Icono</th><th>Nombre</th><th>Color</th><th style="text-align:right;">Acciones</th></tr></thead><tbody>${filas || '<tr><td colspan="4" style="text-align:center; padding:20px;">No hay especialidades</td></tr>'}</tbody></table></div>
    </div></div>
  `);
}


function renderEstadisticas() {
  renderizar(`<div id="app-layout">${htmlSidebar('estadisticas')}<div id="main-content" class="fade-in"><h1 class="page-title">Estadísticas del Hospital</h1><p>Total de Turnos: <strong>${estado.turnos.length}</strong></p><p>Total de Usuarios: <strong>${estado.usuarios.length}</strong></p><p>Total de Especialidades: <strong>${estado.especialidades.length}</strong></p></div></div>`);
}

function renderAgenda() {
  const { mesActual, anioActual } = estado.calendario;
  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const primerDia = new Date(anioActual, mesActual, 1).getDay();
  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
  let offsetCeldasVacias = primerDia === 0 ? 6 : primerDia - 1; 

  let celdasHTML = '';
  for (let i = 0; i < offsetCeldasVacias; i++) celdasHTML += `<div class="cal-day empty"></div>`;

  for (let dia = 1; dia <= diasEnMes; dia++) {
    // Calculamos qué día de la semana cae este número del calendario
    const diaDeLaSemana = new Date(anioActual, mesActual, dia).getDay();
    
    // Filtramos las agendas que atiendan ese día de la semana
    const eventosDia = estado.agendas.filter(a => a.diaSemana === diaDeLaSemana);
    
    const eventosHTML = eventosDia.map(e => {
      const doc = estado.usuarios.find(u => u.id == e.doctorId);
      return `<div class="cal-event" onclick="borrarAgenda(${e.id})" title="Eliminar horario">${e.horaInicio} - ${doc ? doc.nombreCompleto.split(' ')[1] : 'Doc'}</div>`;
    }).join('');
    
    celdasHTML += `<div class="cal-day"><div class="cal-num">${dia}</div>${eventosHTML}</div>`;
  }

  const opcionesEsp = estado.especialidades.map(e => `<option value="${e.id}">${e.icono} ${e.nombre}</option>`).join('');

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
    ${estilosCalendario}
    <div id="app-layout">${htmlSidebar('agenda')}<div id="main-content" class="fade-in">
      <h1 class="page-title">Agenda y Calendario</h1>
      <div class="card" style="margin-bottom: 24px;">
        <h3 style="font-weight:700; margin-bottom: 16px;">📆 Nuevo Horario Recurrente</h3>
        
        <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end;">
          <div class="field" style="flex: 1; min-width: 200px; margin-bottom: 0;">
            <label>Especialidad</label>
            <select id="agenda-esp" class="input" onchange="actualizarSelectDoctores(this.value)"><option value="">Seleccioná...</option>${opcionesEsp}</select>
          </div>
          
          <div class="field" style="flex: 1; min-width: 200px; margin-bottom: 0;">
            <label>Especialista</label>
            <select id="agenda-doc" class="input" disabled><option value="">Primero elegí especialidad</option></select>
          </div>
          
          <div class="field" style="width: 140px; margin-bottom: 0;">
            <label>Día de atención</label>
            <select id="agenda-dia" class="input">
              <option value="">Seleccionar...</option>
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miércoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
              <option value="6">Sábado</option>
              <option value="0">Domingo</option>
            </select>
          </div>

          <div class="field" style="width: 90px; margin-bottom: 0;">
            <label>Inicio</label>
            <input id="agenda-inicio" type="time" class="input" />
          </div>
          
          <div class="field" style="width: 90px; margin-bottom: 0;">
            <label>Fin</label>
            <input id="agenda-fin" type="time" class="input" />
          </div>
          
          <button class="btn btn-primary" style="height: 38px;" onclick="guardarAgenda()">Agregar</button>
        </div>
      </div>
      
      <div style="display:flex; align-items:center; justify-content:center; gap: 20px; margin-top: 30px;">
        <button class="btn btn-ghost" onclick="cambiarMes(-1)">◀ Mes Anterior</button>
        <h2 style="font-size: 24px; font-weight: 700; width: 250px; text-align:center;">${nombresMeses[mesActual]} ${anioActual}</h2>
        <button class="btn btn-ghost" onclick="cambiarMes(1)">Mes Siguiente ▶</button>
      </div>
      
      <div class="pink-cal-wrapper">
        <div class="cal-header-row"><div>LUNES</div><div>MARTES</div><div>MIÉRCOLES</div><div>JUEVES</div><div>VIERNES</div><div>SÁBADO</div><div>DOMINGO</div></div>
        <div class="cal-grid">${celdasHTML}</div>
      </div>
    </div></div>
  `);
}

// Vista de Gestión de Suspensiones e Inasistencias [cite: 56]
function renderSuspensiones() {
    renderizar(`
        <div id="app-layout">${htmlSidebar('suspensiones')}<div id="main-content" class="fade-in">
            <h1 class="page-title">Gestión de Suspensiones</h1>
            
            <div class="card" style="margin-bottom:20px; border-left: 3px solid #e63946;">
                <h3 style="margin-bottom:10px">⚙️ Configurar Límite de Inasistencias</h3> <div style="display:flex; gap:10px; align-items:flex-end;">
                    <div class="field" style="margin:0;"><label>Máximo de ausencias permitidas</label><input type="number" value="3" class="input" style="width:100px;"></div>
                    <button class="btn btn-primary" onclick="notificar('Límite actualizado')">Guardar Regla</button>
                </div>
                <p style="font-size:12px; color:var(--text-muted); margin-top:10px;">Si el paciente supera este límite, el Sistema aplicará la suspensión automática. </p>
            </div>

            <div class="table-wrapper">
                <table>
                    <thead><tr><th>Paciente</th><th>Inasistencias</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        <tr><td>Juan Pérez</td><td>4</td><td><span class="badge" style="background:#e6394622;color:#e63946">Suspendido</span></td><td><button class="btn btn-success btn-small" onclick="notificar('Suspensión Levantada')">Levantar Suspensión</button></td></tr> </tbody>
                </table>
            </div>
        </div></div>
    `);
}

// Vista de Pagos [cite: 56]
function renderPagos() {
    renderizar(`
        <div id="app-layout">${htmlSidebar('pagos')}<div id="main-content" class="fade-in">
            <h1 class="page-title">Control de Pagos de Consultas</h1>
            <p>Aquí se registrarán y controlarán los pagos de los turnos atendidos.</p> </div></div>
    `);
}