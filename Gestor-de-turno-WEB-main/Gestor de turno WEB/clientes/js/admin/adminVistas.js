function renderUsuarios() {
  const { usuarios, especialidades } = estado;
  
  let filasHTML = usuarios.map(u => {
    const esp = especialidades.find(e => e.id == u.especialidadId);
    return `
      <tr style="border-bottom: 1px solid ${COLOR_MINT.mintLight}44;">
        <td style="padding: 14px 12px; color: ${COLOR_MINT.emeraldDark};"><strong>${u.nombreCompleto}</strong></td>
        <td style="padding: 14px 12px; color: ${COLOR_MINT.lightGray};">@${u.username}</td>
        <td style="padding: 14px 12px;">${badgeRol(u.rol)}</td>
        <td style="padding: 14px 12px; color: ${COLOR_MINT.emeraldDark};">${esp ? esp.nombre : '—'}</td>
        <td style="padding: 14px 12px; text-align:right;">
          <button class="btn btn-ghost" style="border: 1px solid ${COLOR_MINT.mintLight}; color: ${COLOR_MINT.emeraldDark}; font-size:12px; padding:6px 12px; font-weight:600;" onclick="editarEspecialista(${u.id})">Editar</button>
        </td>
      </tr>
    `;
  }).join('');

  const opcionesEsp = especialidades.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');

  renderizar(`
    <div id="app-layout">${htmlSidebar('usuarios')}<div id="main-content" class="fade-in" style="background-color: ${COLOR_MINT.bgTint}; min-height: 100vh;">
      <h1 class="page-title" style="color: ${COLOR_MINT.emeraldDark};">Directorio de Usuarios y Especialistas</h1>
      
      <div class="card" style="margin-bottom: 24px; background: white; border: 1px solid ${COLOR_MINT.mintLight}; border-radius:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
        <h3 id="form-titulo" style="font-weight:700; margin-bottom: 16px; color: ${COLOR_MINT.emeraldDark};">Agregar o Editar Usuario</h3>
        <input type="hidden" id="usr-id">
        <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end;">
          <div class="field" style="flex: 1; min-width: 200px; margin-bottom: 0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size: 13px;">Nombre Completo</label>
            <input id="usr-nombre" class="input" style="border: 1px solid ${COLOR_MINT.mintLight}; background: white; color: #333;" placeholder="Ej: Dr. Juan Pérez" />
          </div>
          <div class="field" style="flex: 1; min-width: 150px; margin-bottom: 0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size: 13px;">Usuario de Acceso</label>
            <input id="usr-user" class="input" style="border: 1px solid ${COLOR_MINT.mintLight}; background: white; color: #333;" placeholder="Ej: doc.juan" />
          </div>
          <div class="field" style="flex: 1; min-width: 150px; margin-bottom: 0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size: 13px;">Especialidad Médica</label>
            <select id="usr-esp" class="input" style="border: 1px solid ${COLOR_MINT.mintLight}; background: white; color: #333;">
              <option value="">Ninguna...</option>
              ${opcionesEsp}
            </select>
          </div>
          <div class="field" style="flex: 1; min-width: 120px; margin-bottom: 0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size: 13px;">DNI</label>
            <input id="usr-dni" class="input" style="border: 1px solid ${COLOR_MINT.mintLight}; background: white; color: #333;" placeholder="Ej: 30123456" />
          </div>
          <div class="field" style="flex: 1; min-width: 120px; margin-bottom: 0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size: 13px;">Teléfono</label>
            <input id="usr-tel" class="input" style="border: 1px solid ${COLOR_MINT.mintLight}; background: white; color: #333;" placeholder="Ej: 3777-123456" />
          </div>
          <div class="field" style="flex: 1; min-width: 120px; margin-bottom: 0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size: 13px;">Matrícula</label>
            <input id="usr-matricula" class="input" style="border: 1px solid ${COLOR_MINT.mintLight}; background: white; color: #333;" placeholder="Ej: MP-1234" />
          </div>
          <button class="btn btn-primary" style="height: 40px; background-color: ${COLOR_MINT.vibrantMint}; border-color: ${COLOR_MINT.vibrantMint}; font-weight:700; padding: 0 20px;" onclick="guardarEspecialista()">Guardar</button>
          <button class="btn btn-ghost" style="height: 40px; border: 1px solid ${COLOR_MINT.mintLight}; color: ${COLOR_MINT.emeraldDark}; font-weight:600; padding: 0 20px;" onclick="renderUsuarios()">Cancelar</button>
        </div>
      </div>
      
      <div class="card" style="background: white; border: 1px solid ${COLOR_MINT.mintLight}; border-top: 4px solid ${COLOR_MINT.emeraldDark}; border-radius:8px; padding: 0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
        <div class="table-wrapper" style="margin: 0;">
          <table style="width: 100%; border-collapse: collapse; margin: 0;">
            <thead>
              <tr style="background-color: ${COLOR_MINT.emeraldDark}; color: white; text-align: left;">
                <th style="padding: 16px 12px; font-weight: 600;">Nombre y Apellido</th>
                <th style="padding: 16px 12px; font-weight: 600;">Usuario</th>
                <th style="padding: 16px 12px; font-weight: 600;">Rol Asignado</th>
                <th style="padding: 16px 12px; font-weight: 600;">Especialidad</th>
                <th style="padding: 16px 12px; font-weight: 600; text-align:right;">Gestión</th>
              </tr>
            </thead>
            <tbody>${filasHTML}</tbody>
          </table>
        </div>
      </div>
    </div></div>
  `);
}

function renderEspecialidades() {
  const { especialidades } = estado;
  
  let filasHTML = especialidades.map(e => `
    <tr style="border-bottom: 1px solid ${COLOR_MINT.mintLight}44;">
      <td style="padding: 14px 12px; font-weight: 700; color: ${COLOR_MINT.emeraldDark};">${e.nombre}</td>
      <td style="padding: 14px 12px;">
        <div style="width: 28px; height: 28px; border-radius: 6px; background-color: ${e.color}; border: 1px solid ${COLOR_MINT.mintLight};"></div>
      </td>
      <td style="padding: 14px 12px; text-align:right;">
        <button class="btn btn-ghost" style="border: 1px solid #dc2626; color: #dc2626; font-size:12px; padding:6px 12px; font-weight:600;" onclick="borrarEspecialidad(${e.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');

  renderizar(`
    <div id="app-layout">${htmlSidebar('gestionar_esp')}<div id="main-content" class="fade-in" style="background-color: ${COLOR_MINT.bgTint}; min-height: 100vh;">
      <h1 class="page-title" style="color: ${COLOR_MINT.emeraldDark};">Gestión de Especialidades</h1>
      
      <div class="card" style="margin-bottom: 24px; background: white; border: 1px solid ${COLOR_MINT.mintLight}; border-radius:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
        <h3 style="font-weight:700; margin-bottom: 16px; color: ${COLOR_MINT.emeraldDark};">Registrar Nueva Especialidad</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end;">
          <div class="field" style="flex: 1; min-width: 200px; margin-bottom: 0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size: 13px;">Nombre de la rama médica</label>
            <input id="esp-nombre" class="input" style="border: 1px solid ${COLOR_MINT.mintLight}; background: white; color: #333;" placeholder="Ej: Neurología" />
          </div>
          <div class="field" style="width: 120px; margin-bottom: 0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size: 13px;">Color de Etiqueta</label>
            <input id="esp-color" type="color" class="input" style="border: 1px solid ${COLOR_MINT.mintLight}; padding: 2px; height: 40px; background: white; cursor: pointer;" value="${COLOR_MINT.vibrantMint}" />
          </div>
          <button class="btn btn-primary" style="height: 40px; background-color: ${COLOR_MINT.vibrantMint}; border-color: ${COLOR_MINT.vibrantMint}; font-weight:700; padding: 0 25px;" onclick="guardarNuevaEspecialidad()">Guardar</button>
        </div>
      </div>
      
      <div class="card" style="background: white; border: 1px solid ${COLOR_MINT.mintLight}; border-top: 4px solid ${COLOR_MINT.emeraldDark}; border-radius:8px; max-width: 700px; padding: 0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
        <div class="table-wrapper" style="margin: 0;">
          <table style="width: 100%; border-collapse: collapse; margin: 0;">
            <thead>
              <tr style="background-color: ${COLOR_MINT.emeraldDark}; color: white; text-align: left;">
                <th style="padding: 16px 12px; font-weight: 600;">Especialidad</th>
                <th style="padding: 16px 12px; font-weight: 600;">Color Referencial</th>
                <th style="padding: 16px 12px; font-weight: 600; text-align:right;">Gestión</th>
              </tr>
            </thead>
            <tbody>${filasHTML}</tbody>
          </table>
        </div>
      </div>
    </div></div>
  `);
}

function renderAgenda() {
  const { mesActual, anioActual } = estado.calendario;
  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const primerDia = new Date(anioActual, mesActual, 1).getDay();
  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
  let offsetCeldasVacias = primerDia === 0 ? 6 : primerDia - 1;

  const estilosCeldaVacia = `min-height:110px; padding:8px; display:flex; flex-direction:column; gap:5px; background:#f8fafc;`;
  const estilosCeldaActiva = `min-height:110px; padding:8px; display:flex; flex-direction:column; gap:5px; background:white;`;
  const estilosEvento = `background:${COLOR_MINT.waterGreen}; color:#fff; font-size:11px; padding:5px 8px; border-radius:4px; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:600; box-shadow:0 2px 4px rgba(0,0,0,0.1);`;

  let celdasHTML = '';
  for (let i = 0; i < offsetCeldasVacias; i++) {
    celdasHTML += `<div style="${estilosCeldaVacia}"></div>`;
  }

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const diaDeLaSemana = new Date(anioActual, mesActual, dia).getDay();
    const eventosDia = estado.agendas.filter(a => a.diaSemana === diaDeLaSemana);
    
    const eventosHTML = eventosDia.map(e => {
      const doc = estado.usuarios.find(u => u.id == e.doctorId);
      return `<div style="${estilosEvento}" onclick="borrarAgenda(${e.id})" title="Clic para eliminar este horario">${e.horaInicio} - ${doc ? doc.nombreCompleto.split(' ')[1] : 'Med'}</div>`;
    }).join('');
    
    celdasHTML += `<div style="${estilosCeldaActiva}"><div style="color:${COLOR_MINT.emeraldDark}; font-weight:800; font-size:14px;">${dia}</div>${eventosHTML}</div>`;
  }

  const opcionesEsp = estado.especialidades.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');

  // Estilos inyectados en <head> para garantizar que el navegador los aplique
  const styleId = 'cal-admin-styles';
  if (!document.getElementById(styleId)) {
    const tag = document.createElement('style');
    tag.id = styleId;
    tag.textContent = `
      .cal-dia-celda:hover { background: #f0faf7 !important; }
      .cal-evento-bloque:hover { opacity: 0.85; transform: scale(1.02); }
    `;
    document.head.appendChild(tag);
  }

  renderizar(`
    <div id="app-layout">${htmlSidebar('agenda')}<div id="main-content" class="fade-in" style="background-color: ${COLOR_MINT.bgTint}; min-height: 100vh;">
      <h1 class="page-title" style="color: ${COLOR_MINT.emeraldDark};">Gestión General de Horarios</h1>
      
      <div class="card" style="margin-bottom: 24px; background: white; border: 1px solid ${COLOR_MINT.mintLight}; border-radius:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
        <h3 style="font-weight:700; margin-bottom: 16px; color: ${COLOR_MINT.emeraldDark};">Cargar Bloque de Atención Recurrente</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end;">
          <div class="field" style="flex: 1; min-width: 180px; margin-bottom: 0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size: 13px;">Especialidad</label>
            <select id="agenda-esp" class="input" style="border: 1px solid ${COLOR_MINT.mintLight}; background: white; color: #333;" onchange="actualizarSelectDoctores(this.value)"><option value="">Seleccioná...</option>${opcionesEsp}</select>
          </div>
          <div class="field" style="flex: 1; min-width: 180px; margin-bottom: 0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size: 13px;">Especialista Médico</label>
            <select id="agenda-doc" class="input" style="border: 1px solid ${COLOR_MINT.mintLight}; background: white; color: #333;" disabled><option value="">Primero elegí especialidad</option></select>
          </div>
          <div class="field" style="width: 150px; margin-bottom: 0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size: 13px;">Día a repetir</label>
            <select id="agenda-dia" class="input" style="border: 1px solid ${COLOR_MINT.mintLight}; background: white; color: #333;">
              <option value="">Seleccionar...</option>
              <option value="1">Lunes</option><option value="2">Martes</option><option value="3">Miércoles</option>
              <option value="4">Jueves</option><option value="5">Viernes</option><option value="6">Sábado</option><option value="0">Domingo</option>
            </select>
          </div>
          <div class="field" style="width: 100px; margin-bottom: 0;"><label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size: 13px;">Hora Inicio</label><input id="agenda-inicio" type="time" class="input" style="border: 1px solid ${COLOR_MINT.mintLight}; background: white; color: #333;" /></div>
          <div class="field" style="width: 100px; margin-bottom: 0;"><label style="color:${COLOR_MINT.emeraldDark}; font-weight:600; font-size: 13px;">Hora Fin</label><input id="agenda-fin" type="time" class="input" style="border: 1px solid ${COLOR_MINT.mintLight}; background: white; color: #333;" /></div>
          <button class="btn btn-primary" style="height: 40px; background-color: ${COLOR_MINT.vibrantMint}; border-color: ${COLOR_MINT.vibrantMint}; font-weight:700; padding: 0 25px;" onclick="guardarAgenda()">Guardar</button>
        </div>
      </div>
      
      <div style="display:flex; align-items:center; justify-content:center; gap: 20px; margin-top: 30px; margin-bottom: 20px;">
        <button class="btn btn-ghost" style="border: 1px solid ${COLOR_MINT.mintLight}; color:${COLOR_MINT.emeraldDark}; font-weight:600; padding: 8px 16px;" onclick="cambiarMes(-1)">Anterior</button>
        <h2 style="font-size: 24px; font-weight: 800; width: 250px; text-align:center; color: ${COLOR_MINT.emeraldDark}; margin:0;">${nombresMeses[mesActual]} ${anioActual}</h2>
        <button class="btn btn-ghost" style="border: 1px solid ${COLOR_MINT.mintLight}; color:${COLOR_MINT.emeraldDark}; font-weight:600; padding: 8px 16px;" onclick="cambiarMes(1)">Siguiente</button>
      </div>
      
      <div style="background:white; border:1px solid ${COLOR_MINT.mintLight}; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.04);">
        <div style="display:grid; grid-template-columns:repeat(7, 1fr); background:${COLOR_MINT.emeraldDark}; color:white; text-align:center; font-weight:700; font-size:13px; letter-spacing:0.5px;">
          <div style="padding:14px 0; border-right:1px solid rgba(255,255,255,0.1);">LUNES</div>
          <div style="padding:14px 0; border-right:1px solid rgba(255,255,255,0.1);">MARTES</div>
          <div style="padding:14px 0; border-right:1px solid rgba(255,255,255,0.1);">MIÉRCOLES</div>
          <div style="padding:14px 0; border-right:1px solid rgba(255,255,255,0.1);">JUEVES</div>
          <div style="padding:14px 0; border-right:1px solid rgba(255,255,255,0.1);">VIERNES</div>
          <div style="padding:14px 0; border-right:1px solid rgba(255,255,255,0.1);">SÁBADO</div>
          <div style="padding:14px 0;">DOMINGO</div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(7, 1fr); background:#e2e8f0; gap:1px;">
          ${celdasHTML}
        </div>
      </div>
    </div></div>
  `);
}

// Vistas en desarrollo adaptadas al nuevo diseño
function renderPagos() { renderizar(`<div id="app-layout">${htmlSidebar('pagos')}<div id="main-content" class="fade-in" style="background-color:${COLOR_MINT.bgTint}; min-height: 100vh;"><h1 class="page-title" style="color:${COLOR_MINT.emeraldDark};">Gestión de Pagos</h1><div class="card" style="background:white; border: 1px solid ${COLOR_MINT.mintLight}; border-left: 4px solid ${COLOR_MINT.vibrantMint}; box-shadow: 0 4px 12px rgba(0,0,0,0.02);"><h3 style="color:${COLOR_MINT.emeraldDark}; font-weight: 700; margin-bottom:10px;">Módulo en desarrollo</h3><p style="color: ${COLOR_MINT.lightGray};">Aquí se integrará el control y auditoría de aranceles de consultas médicas.</p></div></div></div>`); }
function renderSuspensiones() { renderizar(`<div id="app-layout">${htmlSidebar('suspensiones')}<div id="main-content" class="fade-in" style="background-color:${COLOR_MINT.bgTint}; min-height: 100vh;"><h1 class="page-title" style="color:${COLOR_MINT.emeraldDark};">Gestión de Suspensiones</h1><div class="card" style="background:white; border: 1px solid ${COLOR_MINT.mintLight}; border-left: 4px solid ${COLOR_MINT.vibrantMint}; box-shadow: 0 4px 12px rgba(0,0,0,0.02);"><h3 style="color:${COLOR_MINT.emeraldDark}; font-weight: 700; margin-bottom:10px;">Módulo en desarrollo</h3><p style="color: ${COLOR_MINT.lightGray};">Control automático de inasistencias acumuladas y bloqueos preventivos.</p></div></div></div>`); }