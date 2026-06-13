function renderMiAgendaDoctor() {
  const { mesActual, anioActual } = estado.calendario;
  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const primerDia = new Date(anioActual, mesActual, 1).getDay();
  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
  let offsetCeldasVacias = primerDia === 0 ? 6 : primerDia - 1;

  const estilosCeldaVacia = `background:#f8fafc; min-height:90px; padding:6px; display:flex; flex-direction:column; gap:4px;`;
  const estilosCeldaActiva = `background:white; min-height:90px; padding:6px; display:flex; flex-direction:column; gap:4px;`;
  const estilosEvento = `background:${COLOR_MINT.vibrantMint}; color:white; text-align:center; padding:5px 8px; border-radius:4px; cursor:pointer; font-weight:700; font-size:12px; box-shadow:0 2px 4px rgba(0,0,0,0.1);`;

  let celdasHTML = '';
  for (let i = 0; i < offsetCeldasVacias; i++) {
    celdasHTML += `<div style="${estilosCeldaVacia}"></div>`;
  }

  const misHorarios = estado.agendas.filter(a => a.doctorId == estado.usuario.id);

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const diaDeLaSemana = new Date(anioActual, mesActual, dia).getDay();
    const eventosDia = misHorarios.filter(a => a.diaSemana === diaDeLaSemana);

    const eventosHTML = eventosDia.map(e => `
      <div style="${estilosEvento}" onclick="borrarAgendaDoctor(${e.id})" title="Clic para eliminar este horario">
        ${e.horaInicio} - ${e.horaFin}
      </div>
    `).join('');

    celdasHTML += `<div style="${estilosCeldaActiva}">
      <div style="color:${COLOR_MINT.emeraldDark}; font-weight:700; font-size:14px;">${dia}</div>
      ${eventosHTML}
    </div>`;
  }

  // Inyectar estilos hover en <head> (única forma correcta de hacerlo)
  const styleId = 'cal-doc-styles';
  if (!document.getElementById(styleId)) {
    const tag = document.createElement('style');
    tag.id = styleId;
    tag.textContent = `.cal-evento-doc:hover { opacity: 0.85; transform: scale(1.02); }`;
    document.head.appendChild(tag);
  }

  renderizar(`
    <div id="app-layout">${htmlSidebar('mi_agenda_doc')}<div id="main-content" class="fade-in" style="background-color:${COLOR_MINT.bgTint}; min-height:100vh;">
      <h1 class="page-title" style="color:${COLOR_MINT.emeraldDark};">Configurar Mis Horarios de Atención</h1>

      <div class="card" style="margin-bottom:24px; background:white; border:1px solid ${COLOR_MINT.mintLight}; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.02);">
        <h3 style="font-weight:700; margin-bottom:16px; color:${COLOR_MINT.emeraldDark};">Agregar Día Recurrente</h3>
        <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:flex-end;">
          <div class="field" style="width:180px; margin-bottom:0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600;">Día de la semana</label>
            <select id="doc-agenda-dia" class="input" style="border:1px solid ${COLOR_MINT.mintLight}; background:white; color:#333;">
              <option value="">Seleccionar día...</option>
              <option value="1">Todos los Lunes</option><option value="2">Todos los Martes</option><option value="3">Todos los Miércoles</option>
              <option value="4">Todos los Jueves</option><option value="5">Todos los Viernes</option><option value="6">Todos los Sábados</option><option value="0">Todos los Domingos</option>
            </select>
          </div>
          <div class="field" style="width:110px; margin-bottom:0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600;">Hora Entrada</label>
            <input id="doc-agenda-inicio" type="time" class="input" style="border:1px solid ${COLOR_MINT.mintLight}; background:white; color:#333;" />
          </div>
          <div class="field" style="width:110px; margin-bottom:0;">
            <label style="color:${COLOR_MINT.emeraldDark}; font-weight:600;">Hora Salida</label>
            <input id="doc-agenda-fin" type="time" class="input" style="border:1px solid ${COLOR_MINT.mintLight}; background:white; color:#333;" />
          </div>
          <button class="btn btn-primary" style="height:38px; background-color:${COLOR_MINT.vibrantMint}; border-color:${COLOR_MINT.vibrantMint}; font-weight:700;" onclick="guardarAgendaDoctor()">Establecer Horario</button>
        </div>
      </div>

      <div style="display:flex; align-items:center; justify-content:center; gap:20px; margin-top:30px; margin-bottom:20px;">
        <button class="btn btn-ghost" style="border:1px solid ${COLOR_MINT.mintLight}; color:${COLOR_MINT.emeraldDark}; font-weight:600; padding:8px 16px;" onclick="cambiarMes(-1); renderMiAgendaDoctor();">Mes Anterior</button>
        <h2 style="font-size:22px; font-weight:700; width:250px; text-align:center; color:${COLOR_MINT.emeraldDark}; margin:0;">${nombresMeses[mesActual]} ${anioActual}</h2>
        <button class="btn btn-ghost" style="border:1px solid ${COLOR_MINT.mintLight}; color:${COLOR_MINT.emeraldDark}; font-weight:600; padding:8px 16px;" onclick="cambiarMes(1); renderMiAgendaDoctor();">Mes Siguiente</button>
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