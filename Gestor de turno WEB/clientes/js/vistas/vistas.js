/* =========================================================================
   VISTAS GLOBALES Y DISEÑO BASE
========================================================================= */

function notificar(mensaje, tipo = 'success') {
  const el = document.getElementById('notification');
  el.textContent = mensaje;
  el.style.display = 'block';
  el.style.background = tipo === 'error' ? '#dc2626' : '#059669';
  el.style.color = '#fff';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.display = 'none'; }, 3000);
}

function renderizar(html) {
  const root = document.getElementById('root');
  root.innerHTML = html;
  root.firstElementChild?.classList.add('fade-in');
}

// --- PANTALLAS DE LOGIN SEPARADAS ---
function mostrarPantallaInicio() {
  renderizar(`
    <div class="auth-screen">
      <div class="auth-box" style="max-width: 650px;">
        <div style="text-align:center;margin-bottom:30px">
            <div style="font-size:52px;margin-bottom:8px">🏥</div>
            <h1 style="font-size:28px;font-weight:800;letter-spacing:-0.5px">Hospital Central</h1>
            <p style="color:var(--text-muted); margin-top:10px;">Seleccione su portal de acceso</p>
        </div>
        <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
            <div class="card" style="flex:1; min-width: 200px; text-align:center; cursor:pointer;" onclick="mostrarLoginPaciente()">
                <div style="font-size: 50px; margin-bottom: 15px;">🧑‍⚕️</div>
                <h3 style="font-weight: 700;">Portal Pacientes</h3>
                <p style="font-size: 13px; color: var(--text-muted); margin-top: 10px;">Solicitar turnos y ver historial</p>
            </div>
            <div class="card" style="flex:1; min-width: 200px; text-align:center; cursor:pointer;" onclick="mostrarLoginPersonal()">
                <div style="font-size: 50px; margin-bottom: 15px;">🩺</div>
                <h3 style="font-weight: 700;">Portal Personal</h3>
                <p style="font-size: 13px; color: var(--text-muted); margin-top: 10px;">Acceso Médicos y Administración</p>
            </div>
        </div>
      </div>
    </div>
  `);
}

function mostrarLoginPaciente(errorMsg = '') {
  renderizar(`
    <div class="auth-screen"><div class="auth-box">
        <button class="btn btn-ghost" style="margin-bottom:20px;" onclick="mostrarPantallaInicio()">← Volver</button>
        <div style="text-align:center;margin-bottom:28px"><div style="font-size:40px;">🧑‍⚕️</div><h1 style="font-size:24px;font-weight:800;">Pacientes</h1></div>
        <div class="card" style="border-top: 4px solid #0ea5e9">
          <div class="field"><label>Usuario</label><input id="login-user" class="input" placeholder="Ej: paciente" onkeydown="if(event.key==='Enter') ejecutarLogin('PACIENTE')" /></div>
          <div class="field"><label>Contraseña</label><input id="login-pass" class="input" type="password" placeholder="1234" onkeydown="if(event.key==='Enter') ejecutarLogin('PACIENTE')" /></div>
          ${errorMsg ? `<p class="error-msg">⚠️ ${errorMsg}</p>` : ''}
          <button class="btn btn-primary" style="width:100%;padding:12px; background-color: #0ea5e9; border-color: #0ea5e9;" onclick="ejecutarLogin('PACIENTE')">Ingresar</button>
        </div>
    </div></div>
  `);
}

function mostrarLoginPersonal(errorMsg = '') {
  renderizar(`
    <div class="auth-screen"><div class="auth-box">
        <button class="btn btn-ghost" style="margin-bottom:20px;" onclick="mostrarPantallaInicio()">← Volver</button>
        <div style="text-align:center;margin-bottom:28px"><div style="font-size:40px;">🏥</div><h1 style="font-size:24px;font-weight:800;">Institucional</h1></div>
        <div class="card" style="border-top: 4px solid var(--accent)">
          <div class="field"><label>Usuario</label><input id="login-user" class="input" placeholder="Ej: admin o doctor" onkeydown="if(event.key==='Enter') ejecutarLogin('PERSONAL')" /></div>
          <div class="field"><label>Contraseña</label><input id="login-pass" class="input" type="password" placeholder="1234" onkeydown="if(event.key==='Enter') ejecutarLogin('PERSONAL')" /></div>
          ${errorMsg ? `<p class="error-msg">⚠️ ${errorMsg}</p>` : ''}
          <button class="btn btn-primary" style="width:100%;padding:12px" onclick="ejecutarLogin('PERSONAL')">Iniciar Sesión Segura</button>
        </div>
    </div></div>
  `);
}

// --- SIDEBAR Y HELPERS ---
function badgeEstado(estadoStr) {
  const config = { PENDIENTE: { color: '#f4a261', label: 'Pendiente' }, EN_CURSO: { color: '#4cc9f0', label: 'En curso' }, COMPLETADO: { color: '#2a9d8f', label: 'Completado' }, CANCELADO: { color: '#e63946', label: 'Cancelado' }, AUSENTE: { color: '#e63946', label: 'Ausente' } };
  const c = config[estadoStr] || { color: '#888', label: estadoStr };
  return `<span class="badge" style="background:${c.color}22;color:${c.color}">${c.label}</span>`;
}

function badgeRol(rol) {
  const colores = { ADMIN: '#f59e0b', DOCTOR: '#34d399', PACIENTE: '#60a5fa' };
  return `<span class="badge" style="background:${colores[rol]}22;color:${colores[rol]}">${rol}</span>`;
}

function nombreEspecialidad(id) { const esp = estado.especialidades.find(e => e.id == id); return esp ? esp.nombre : '—'; }
function colorEspecialidad(id) { const esp = estado.especialidades.find(e => e.id == id); return esp ? esp.color : '#888'; }

function htmlSidebar(seccionActiva) {
  const { usuario } = estado;
  const itemsComunes = [{ id: 'dashboard', icon: '📊', label: 'Panel' }];
  
  const itemsPaciente = [
    { id: 'nuevo_turno', icon: '➕', label: 'Pedir Turno' }, 
    { id: 'mis_turnos', icon: '📅', label: 'Mis Turnos' },
    { id: 'historial', icon: '📂', label: 'Historial Médico' }
  ];
  
  const itemsPersonal = [
    { id: 'mis_turnos', icon: '📅', label: 'Mi Agenda de Turnos' },
    { id: 'mi_agenda_doc', icon: '📆', label: 'Configurar Mis Horarios' }
  ];
  
  const itemsAdmin = [
    { id: 'usuarios', icon: '👨‍⚕️', label: 'Gestión Médicos' },
    { id: 'todos_turnos', icon: '📋', label: 'Supervisar Turnos' },
    { id: 'gestionar_esp', icon: '🩺', label: 'Especialidades' },
    { id: 'agenda', icon: '📆', label: 'Horarios Generales' },
    { id: 'pagos', icon: '💰', label: 'Gestión de Pagos' },
    { id: 'suspensiones', icon: '🚫', label: 'Suspensiones' }
  ];

  let items = [...itemsComunes];
  if (usuario.rol === 'PACIENTE') items = [...items, ...itemsPaciente];
  if (usuario.rol === 'DOCTOR') items = [...items, ...itemsPersonal];
  if (usuario.rol === 'ADMIN') items = [...items, ...itemsAdmin];

  const navHTML = items.map(item => `
    <div class="nav-item ${seccionActiva === item.id ? 'active' : ''}" onclick="navegarA('${item.id}')">
      <span>${item.icon}</span><span>${item.label}</span>
    </div>
  `).join('');

  return `<div id="sidebar"><div class="sidebar-header"><div style="font-size:24px;margin-bottom:4px">🏥</div><div style="font-weight:700;font-size:14px">Hospital Central</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px">${usuario.nombreCompleto}</div><div style="margin-top:6px">${badgeRol(usuario.rol)}</div></div><nav style="flex:1">${navHTML}</nav><button class="btn btn-ghost" style="width:100%;margin-top:16px" onclick="cerrarSesion()">🚪 Cerrar sesión</button></div>`;
}

function renderDashboard() {
  const { usuario, turnos, especialidades } = estado;
  const turnosPermitidos = filtrarTurnosPorRol(turnos, usuario);
  const totalPendientes = turnosPermitidos.filter(t => t.estado === 'PENDIENTE').length;
  const totalCompletados = turnosPermitidos.filter(t => t.estado === 'COMPLETADO').length;

  let htmlEspecialidades = '';
  if (usuario.rol !== 'PACIENTE') {
    htmlEspecialidades = `
      <div class="card"><h3 style="font-weight:700;margin-bottom:16px">Especialidades Activas</h3>
        <div class="grid-branches">
          ${especialidades.map(e => `<div style="background:var(--bg-deep);border:1px solid ${e.color}33;border-radius:10px;padding:14px 12px;display:flex;align-items:center;gap:10px"><span style="font-size:22px">${e.icono}</span><span style="font-size:13px;font-weight:600;color:${e.color}">${e.nombre}</span></div>`).join('')}
        </div>
      </div>
    `;
  }

  renderizar(`
    <div id="app-layout">${htmlSidebar('dashboard')}<div id="main-content" class="fade-in">
      <h1 class="page-title">Bienvenido, ${usuario.nombreCompleto.split(' ')[0]} 👋</h1>
      <div class="grid-stats">
        <div class="card" style="border-left:3px solid #f4a261"><div style="font-size:26px;margin-bottom:8px">⏳</div><div style="font-size:28px;font-weight:800;color:#f4a261">${totalPendientes}</div><div style="color:var(--text-muted);font-size:13px">Turnos pendientes</div></div>
        <div class="card" style="border-left:3px solid #2a9d8f"><div style="font-size:26px;margin-bottom:8px">✅</div><div style="font-size:28px;font-weight:800;color:#2a9d8f">${totalCompletados}</div><div style="color:var(--text-muted);font-size:13px">Turnos Completados</div></div>
      </div>
      ${htmlEspecialidades}
    </div></div>
  `);
}