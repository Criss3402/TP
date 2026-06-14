// Definición de variables de color globales
const COLOR_MINT = {
  whiteGlass: 'rgba(255, 255, 255, 0.85)',
  vibrantMint: '#28C78E',
  emeraldDark: '#18564B',
  mintLight: '#8CD3BA',
  waterGreen: '#5FABA0',
  lightGray: '#7F8C8D',
  bgTint: '#F0F9F6'
};

// BLOQUE PARA FORZAR EL DISEÑO MINT SOBRE EL CSS VIEJO
const estilosGlobalesMint = `
  <style>
    /* 1. Matar el fondo azul oscuro viejo de la pantalla de carga/body */
    body, html {
      background-color: #ffffff !important;
      margin: 0;
      padding: 0;
    }

    /* Forzar el color esmeralda en todas las cabeceras de tablas */
    table thead th, th {
      background-color: ${COLOR_MINT.emeraldDark} !important;
      color: white !important;
      border: none !important;
    }
    
    /* Forzar el estilo claro e iluminado en el menú lateral activo */
    .nav-item.active {
      background-color: ${COLOR_MINT.bgTint} !important;
      color: ${COLOR_MINT.emeraldDark} !important;
      border-left: 4px solid ${COLOR_MINT.vibrantMint} !important;
    }
    
    /* Efecto hover suave para los botones del menú inactivos */
    .nav-item:hover:not(.active) {
      background-color: rgba(140, 211, 186, 0.15) !important;
    }

    /* Asegurar que el fondo de las tablas sea blanco */
    .table-wrapper {
      background: white !important;
    }
  </style>
`;

function notificar(mensaje, tipo = 'success') {
  const el = document.getElementById('notification');
  el.textContent = mensaje;
  el.style.display = 'block';
  el.style.background = tipo === 'error' ? '#dc2626' : COLOR_MINT.vibrantMint;
  el.style.color = '#fff';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// Inyectamos los estilos globales automáticamente en cada renderizado
function renderizar(html) {
  const root = document.getElementById('root');
  root.innerHTML = estilosGlobalesMint + html;
  root.firstElementChild?.classList.add('fade-in');
}

// Estilos CSS comunes para el Login con efecto Cristal Acrílico (Glassmorphism)
const estilosLoginComunes = `
  <style>
    .auth-background {
      position: relative;
      width: 100vw;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      overflow: hidden;
      z-index: 1;
    }
    
    /*imagen de fondo pura y el tinte verde */
    .auth-background::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(rgba(24, 86, 75, 0.4), rgba(24, 86, 75, 0.6)), url('img/doctor.jpg') no-repeat center top/cover;
      z-index: -2;
    }
    
    /*efecto de blur */
    .auth-background::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      mask-image: radial-gradient(circle at center 30%, transparent 15%, black 50%);
      -webkit-mask-image: radial-gradient(circle at center 30%, transparent 15%, black 50%);
      z-index: -1;
    }
    
    /*tarjeta de login acrílica */
    .glass-box {
      background: ${COLOR_MINT.whiteGlass};
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid ${COLOR_MINT.mintLight};
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(24, 86, 75, 0.15);
      width: 100%;
      transition: all 0.3s ease;
    }
    
    .text-emerald-main { color: ${COLOR_MINT.emeraldDark}; font-weight: 800; }
    
    .mint-input {
      border: 1.5px solid ${COLOR_MINT.mintLight} !important;
      border-radius: 8px !important;
      padding: 12px 14px !important;
      background: rgba(255, 255, 255, 0.7) !important;
      color: #333 !important;
    }
    .mint-input::placeholder { color: ${COLOR_MINT.lightGray} !important; }
    .mint-input:focus { border-color: ${COLOR_MINT.vibrantMint} !important; outline: none; }
    
    .btn-mint-submit {
      background-color: ${COLOR_MINT.vibrantMint} !important;
      border: none !important;
      color: white !important;
      font-weight: 700 !important;
      padding: 14px !important;
      border-radius: 8px !important;
      cursor: pointer;
      width: 100%;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: background 0.2s ease;
    }
    .btn-mint-submit:hover { background-color: #20a878 !important; }
    
    .water-link { color: ${COLOR_MINT.waterGreen}; font-size: 13px; text-decoration: none; font-weight: 600; cursor: pointer; }
    .water-link:hover { text-decoration: underline; }
    
    .portal-card-select {
      background: rgba(255, 255, 255, 0.9);
      border: 1.5px solid ${COLOR_MINT.mintLight};
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      cursor: pointer;
      flex: 1;
      min-width: 220px;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .portal-card-select:hover { transform: translateY(-4px); border-color: ${COLOR_MINT.vibrantMint}; }
  </style>
`;

function mostrarPantallaInicio() {
  mostrarLogin();
}

function mostrarLogin(errorMsg = '') {
  renderizar(`
    ${estilosLoginComunes}
    <div class="auth-background">
      <div class="glass-box" style="max-width: 420px;">
        <div style="text-align:center; margin-bottom:30px;">
          <div style="font-size: 42px; margin-bottom: 10px;">🏥</div>
          <h1 class="text-emerald-main" style="font-size: 28px; letter-spacing: -0.5px; margin: 0;">Hospital Central</h1>
          <p style="color: ${COLOR_MINT.lightGray}; margin-top: 8px; font-size: 14px;">Sistema de gestión de turnos médicos</p>
        </div>
        <div>
          <div class="field">
            <label style="color: ${COLOR_MINT.emeraldDark}; font-weight: 600; font-size: 13px;">Correo Electrónico</label>
            <input id="login-user" class="input mint-input" placeholder="Ej: usuario@correo.com" onkeydown="if(event.key==='Enter') ejecutarLogin()" />
          </div>
          <div class="field" style="margin-top:15px;">
            <label style="color: ${COLOR_MINT.emeraldDuted}; font-weight: 600; font-size: 13px; color: ${COLOR_MINT.emeraldDark};">Contraseña</label>
            <input id="login-pass" class="input mint-input" type="password" placeholder="Ingrese su contraseña" onkeydown="if(event.key==='Enter') ejecutarLogin()" />
          </div>
          ${errorMsg ? `<p style="color:#dc2626; font-size:13px; margin: 10px 0 0 0;">⚠️ ${errorMsg}</p>` : ''}
          <div style="margin: 20px 0 15px 0;">
            <button class="btn-mint-submit" onclick="ejecutarLogin()">Iniciar Sesión</button>
          </div>
          <div style="display:flex; justify-content:center; gap:20px; margin-top:10px;">
            <span class="water-link" onclick="mostrarRegistro()">Crear cuenta nueva</span>
          </div>
        </div>
      </div>
    </div>
  `);
}

// Alias para compatibilidad con llamadas existentes en el código
function mostrarLoginPaciente(errorMsg = '') { mostrarLogin(errorMsg); }
function mostrarLoginPersonal(errorMsg = '') { mostrarLogin(errorMsg); }

function mostrarRegistro(errorMsg = '') {
  renderizar(`
    ${estilosLoginComunes}
    <div class="auth-background">
      <div class="glass-box" style="max-width: 480px;">
        <span class="water-link" onclick="mostrarLogin()" style="display:inline-block; margin-bottom:20px;">← Volver al inicio de sesión</span>
        <div style="text-align:center; margin-bottom:25px;">
            <div style="font-size: 36px; margin-bottom: 8px;">👤</div>
            <h2 class="text-emerald-main" style="font-size: 24px; margin: 0;">Crear Cuenta</h2>
            <p style="color: ${COLOR_MINT.lightGray}; font-size: 13px; margin-top: 8px; margin-bottom: 0;">Completá tus datos para registrarte</p>
        </div>
        <div>
          <div style="display:flex; gap:12px;">
            <div class="field" style="flex:1; margin-bottom:0;">
              <label style="color: ${COLOR_MINT.emeraldDark}; font-weight: 600; font-size: 13px;">Nombre</label>
              <input id="reg-nombre" class="input mint-input" placeholder="Ej: Juan" />
            </div>
            <div class="field" style="flex:1; margin-bottom:0;">
              <label style="color: ${COLOR_MINT.emeraldDark}; font-weight: 600; font-size: 13px;">Apellido</label>
              <input id="reg-apellido" class="input mint-input" placeholder="Ej: Pérez" />
            </div>
          </div>
          <div style="display:flex; gap:12px; margin-top:12px;">
            <div class="field" style="flex:1; margin-bottom:0;">
              <label style="color: ${COLOR_MINT.emeraldDark}; font-weight: 600; font-size: 13px;">DNI</label>
              <input id="reg-dni" class="input mint-input" placeholder="Ej: 30123456" />
            </div>
            <div class="field" style="flex:1; margin-bottom:0;">
              <label style="color: ${COLOR_MINT.emeraldDark}; font-weight: 600; font-size: 13px;">Teléfono <span style="font-weight:400; color:${COLOR_MINT.lightGray};">(opcional)</span></label>
              <input id="reg-tel" class="input mint-input" placeholder="Ej: 3777-123456" />
            </div>
          </div>
          <div class="field" style="margin-top:12px; margin-bottom:0;">
            <label style="color: ${COLOR_MINT.emeraldDark}; font-weight: 600; font-size: 13px;">Correo Electrónico</label>
            <input id="reg-email" class="input mint-input" placeholder="Ej: juan@correo.com" />
          </div>
          <div style="display:flex; gap:12px; margin-top:12px;">
            <div class="field" style="flex:1; margin-bottom:0;">
              <label style="color: ${COLOR_MINT.emeraldDark}; font-weight: 600; font-size: 13px;">Contraseña</label>
              <input id="reg-pass" class="input mint-input" type="password" placeholder="Mínimo 4 caracteres" />
            </div>
            <div class="field" style="flex:1; margin-bottom:0;">
              <label style="color: ${COLOR_MINT.emeraldDark}; font-weight: 600; font-size: 13px;">Confirmar contraseña</label>
              <input id="reg-pass2" class="input mint-input" type="password" placeholder="Repetí tu clave" />
            </div>
          </div>
          ${errorMsg ? `<p style="color:#dc2626; font-size:13px; margin: 10px 0 0 0;">⚠️ ${errorMsg}</p>` : ''}
          <div style="margin: 20px 0 0 0;">
            <button class="btn-mint-submit" onclick="ejecutarRegistroPaciente()">Crear mi cuenta</button>
          </div>
          <p style="text-align:center; font-size:12px; color:${COLOR_MINT.lightGray}; margin-top:15px;">
            Tu cuenta será creada como paciente. Si sos profesional médico, contactá al administrador.
          </p>
        </div>
      </div>
    </div>
  `);
}

// Alias para compatibilidad
function mostrarRegistroPaciente(errorMsg = '') { mostrarRegistro(errorMsg); }

function badgeEstado(estadoStr) {
  const config = { Solicitado: { color: '#f4a261', label: 'Solicitado' }, Confirmado: { color: '#4cc9f0', label: 'Confirmado' }, Atendido: { color: '#2a9d8f', label: 'Atendido' }, Cancelado: { color: '#e63946', label: 'Cancelado' }, Ausente: { color: '#e63946', label: 'Ausente' } };
  const c = config[estadoStr] || { color: '#888', label: estadoStr };
  return `<span class="badge" style="background:${c.color}22;color:${c.color}">${c.label}</span>`;
}

function badgeRol(rol) {
  const colores = { ADMIN: COLOR_MINT.emeraldDark, DOCTOR: COLOR_MINT.vibrantMint, PACIENTE: COLOR_MINT.waterGreen, RECEPCIONISTA: '#7c3aed' };
  return `<span class="badge" style="background:${colores[rol]}22;color:${colores[rol]}">${rol}</span>`;
}

function nombreEspecialidad(id) { const esp = estado.especialidades.find(e => e.id == id); return esp ? esp.nombre : '—'; }

function htmlSidebar(seccionActiva) {
  const { usuario } = estado;
  
  const itemsComunes = [{ id: 'dashboard', label: '🏠 Panel Principal' }];
  const itemsPaciente = [
    { id: 'nuevo_turno', label: '📅 Pedir Turno' },
    { id: 'mis_turnos',  label: '📋 Mis Turnos' },
    { id: 'historial',   label: '📁 Historial Médico' }
  ];
  const itemsPersonal = [
    { id: 'mis_turnos',    label: '📋 Mi Agenda de Turnos' },
    { id: 'mi_agenda_doc', label: '⚙️ Configurar Mis Horarios' }
  ];
  const itemsRecepcionista = [
    { id: 'gestion_medicos',   label: '👨‍⚕️ Gestión de Médicos' },
    { id: 'todos_turnos',      label: '📋 Gestión de Turnos' },
    { id: 'gestion_pacientes', label: '👥 Gestión de Pacientes' },
    { id: 'agenda',            label: '📆 Horarios de Atención' }
  ];
  const itemsAdmin = [
    { id: 'usuarios',          label: '👥 Usuarios del Sistema' },
    { id: 'gestion_medicos',   label: '👨‍⚕️ Gestión de Médicos' },
    { id: 'gestion_pacientes', label: '🏥 Gestión de Pacientes' },
    { id: 'todos_turnos',      label: '📋 Supervisar Turnos' },
    { id: 'gestionar_esp',     label: '🩺 Especialidades' },
    { id: 'agenda',            label: '📆 Horarios Generales' },
    { id: 'pagos',             label: '💳 Gestión de Pagos' },
    { id: 'suspensiones',      label: '🚫 Suspensiones' },
    { id: 'historial_admin',   label: '📁 Historiales Médicos' },
    { id: 'estadisticas',      label: '📊 Estadísticas' }
];

  let items = [...itemsComunes];
  if (usuario.rol === 'PACIENTE')       items = [...items, ...itemsPaciente];
  if (usuario.rol === 'DOCTOR')         items = [...items, ...itemsPersonal];
  if (usuario.rol === 'RECEPCIONISTA')  items = [...items, ...itemsRecepcionista];
  if (usuario.rol === 'ADMIN')          items = [...items, ...itemsAdmin];

  const navHTML = items.map(item => `
    <div class="nav-item ${seccionActiva === item.id ? 'active' : ''}" style="${seccionActiva === item.id ? `background: ${COLOR_MINT.bgTint}; color: ${COLOR_MINT.emeraldDark}; border-left: 4px solid ${COLOR_MINT.vibrantMint};` : ''}" onclick="navegarA('${item.id}')">
      <span style="font-weight: 600;">${item.label}</span>
    </div>
  `).join('');

  return `
    <div id="sidebar" style="background-color: ${COLOR_MINT.emeraldDark}; color: #fff;">
      <div class="sidebar-header" style="border-bottom: 1px solid ${COLOR_MINT.mintLight}33;">
        <div style="font-weight:800; font-size:18px; color:#fff;">Hospital Central</div>
        <div style="font-size:12px; color:${COLOR_MINT.mintLight}; margin-top:2px;">${usuario.nombreCompleto}</div>
        <div style="margin-top:8px;">${badgeRol(usuario.rol)}</div>
      </div>
      <nav style="flex:1; margin-top: 15px;">${navHTML}</nav>
      
      <button class="btn" style="width:100%; margin-top:16px; padding: 12px; background-color: #ef4444; border: 1px solid #dc2626; color: white; font-weight: 700; border-radius: 6px; cursor: pointer;" onclick="cerrarSesion()">Cerrar sesión</button>
    </div>
  `;
}

async function renderDashboard() {
  const { usuario, turnos, especialidades } = estado;
  const turnosPermitidos = filtrarTurnosPorRol(turnos, usuario);
  const totalPendientes = turnosPermitidos.filter(t => t.estado === 'Solicitado').length;
  const totalCompletados = turnosPermitidos.filter(t => t.estado === 'Atendido').length;

  let htmlSuspension = '';
  if (usuario.rol === 'PACIENTE') {
    const resPac = await api.getPacientePorUsuario(usuario.id);
    if (resPac.success && resPac.data?.estado_suspension) {
      const ausencias = resPac.data.cantidad_ausencias || 0;
      const motivo = resPac.data.motivo_suspension || 'Tu cuenta fue suspendida.';
      htmlSuspension = `
        <div style="background:#fef2f2; border:1px solid #fca5a5; border-left:4px solid #e63946; border-radius:12px; padding:24px; margin-bottom:24px;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
            <span style="font-size:32px;">🚫</span>
            <div>
              <h3 style="color:#dc2626; font-weight:700; margin:0; font-size:18px;">Cuenta Suspendida</h3>
              <p style="color:#991b1b; margin:4px 0 0 0; font-size:13px;">Tu acceso está temporalmente restringido</p>
            </div>
          </div>
          <div style="background:white; border-radius:8px; padding:16px; margin-bottom:16px; border:1px solid #fca5a5;">
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div style="display:flex; gap:8px;">
                <span style="color:#dc2626; font-weight:700; font-size:13px; min-width:100px;">Motivo:</span>
                <span style="color:#7f1d1d; font-size:13px;">${motivo}</span>
              </div>
              <div style="display:flex; gap:8px;">
                <span style="color:#dc2626; font-weight:700; font-size:13px; min-width:100px;">Inasistencias:</span>
                <span style="color:#7f1d1d; font-size:13px;">${ausencias} de 3</span>
              </div>
            </div>
          </div>
          <div style="background:#fef9c3; border:1px solid #fde047; border-radius:8px; padding:12px;">
            <p style="color:#713f12; margin:0; font-size:13px;">📞 Para regularizar tu situación, contactá al hospital. Tu cuenta será reactivada por un administrador.</p>
          </div>
        </div>
      `;
    }
  }

  let htmlEspecialidades = '';
  if (usuario.rol !== 'PACIENTE') {
    htmlEspecialidades = `
      <div class="card" style="background: white; border: 1px solid ${COLOR_MINT.mintLight};"><h3 style="font-weight:700; margin-bottom:16px; color: ${COLOR_MINT.emeraldDark};">Especialidades Activas</h3>
        <div class="grid-branches">
          ${especialidades.map(e => `<div style="background:${COLOR_MINT.bgTint}; border:1px solid ${COLOR_MINT.mintLight}44; border-radius:10px; padding:14px 12px; display:flex; align-items:center;"><span style="font-size:14px; font-weight:600; color:${COLOR_MINT.emeraldDark};">${e.nombre}</span></div>`).join('')}
        </div>
      </div>
    `;
  }

  renderizar(`
    <div id="app-layout">${htmlSidebar('dashboard')}<div id="main-content" class="fade-in" style="background-color: ${COLOR_MINT.bgTint};">
      <h1 class="page-title" style="color: ${COLOR_MINT.emeraldDark};">Bienvenido, ${usuario.nombreCompleto.split(' ')[0]}</h1>
      ${htmlSuspension}
      <div class="grid-stats" style="margin-bottom: 25px;">
        <div class="card" style="border-left:4px solid ${COLOR_MINT.waterGreen}; background: white;"><div style="font-size:28px; font-weight:800; color:${COLOR_MINT.waterGreen};">${totalPendientes}</div><div style="color:${COLOR_MINT.lightGray}; font-size:13px; margin-top:5px;">Turnos pendientes</div></div>
        <div class="card" style="border-left:4px solid ${COLOR_MINT.vibrantMint}; background: white;"><div style="font-size:28px; font-weight:800; color:${COLOR_MINT.vibrantMint};">${totalCompletados}</div><div style="color:${COLOR_MINT.lightGray}; font-size:13px; margin-top:5px;">Turnos Completados</div></div>
      </div>
      ${htmlEspecialidades}
    </div></div>
  `);
}

function renderMisTurnos() {
  const { usuario } = estado;
  const turnosVisibles = filtrarTurnosPorRol(estado.turnos, usuario);
  let filasHTML = '';
  
  if (turnosVisibles.length === 0) {
    filasHTML = '<tr><td colspan="6" style="text-align:center; padding: 30px; color: var(--text-muted);">No hay turnos registrados en el sistema.</td></tr>';
  } else {
    filasHTML = turnosVisibles.map(t => {
      const esp = estado.especialidades.find(e => e.id == t.especialidadId);
      const nombreColumnaExtra = usuario.rol === 'PACIENTE' ? t.doctorNombre : t.pacienteNombre;
      return `
        <tr>
          <td><strong>T-${String(t.id).padStart(4, '0')}</strong></td>
          <td>${t.fecha} | ${t.hora} hs</td>
          <td>${esp ? esp.nombre : '—'}</td>
          <td>${nombreColumnaExtra}</td>
          <td>${badgeEstado(t.estado)}</td>
          <td style="text-align:center;">
            ${usuario.rol === 'DOCTOR' && (t.estado === 'Solicitado' || t.estado === 'Confirmado')
  ? `<div style="display:flex; gap:6px; justify-content:center;">
      <button class="btn btn-primary" style="font-size:12px; padding:4px 8px; background-color:${COLOR_MINT.vibrantMint}; border-color:${COLOR_MINT.vibrantMint};" onclick="abrirAtencionTurno(${t.id})">Atender</button>
      <button class="btn" style="font-size:12px; padding:4px 8px; background-color:#f59e0b; border:1px solid #f59e0b; color:white; border-radius:4px; cursor:pointer; font-weight:600;" onclick="cambiarEstadoTurno(${t.id}, 'Ausente')">Ausente</button>
      <button class="btn" style="font-size:12px; padding:4px 8px; background-color:#e63946; border:1px solid #e63946; color:white; border-radius:4px; cursor:pointer; font-weight:600;" onclick="cambiarEstadoTurno(${t.id}, 'Cancelado')">Cancelar</button>
    </div>`
  : usuario.rol === 'PACIENTE' && (t.estado === 'Solicitado' || t.estado === 'Confirmado')
  ? `<button class="btn" style="font-size:12px; padding:4px 8px; background-color:#e63946; border:1px solid #e63946; color:white; border-radius:4px; cursor:pointer; font-weight:600;" onclick="cancelarTurnoPaciente(${t.id})">Cancelar</button>`
  : `<span style="color:${COLOR_MINT.lightGray}; font-size:12px;">Sin acciones</span>`}
          </td>
        </tr>
      `;
    }).join('');
  }

  const tituloPagina = usuario.rol === 'ADMIN' ? 'Supervisar Todos los Turnos' : 'Mis Turnos Programados';
  const menuActivo = usuario.rol === 'ADMIN' ? 'todos_turnos' : 'mis_turnos';

  renderizar(`
    <div id="app-layout">${htmlSidebar(menuActivo)}<div id="main-content" class="fade-in" style="background-color: ${COLOR_MINT.bgTint};">
      <h1 class="page-title" style="color: ${COLOR_MINT.emeraldDark};">${tituloPagina}</h1>
      <div class="card" style="border-top: 4px solid ${COLOR_MINT.emeraldDark}; background: white; margin-top:20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr style="background-color: ${COLOR_MINT.emeraldDark}; color: white;">
                <th>Código</th><th>Fecha y Hora</th><th>Especialidad</th><th>${usuario.rol === 'PACIENTE' ? 'Profesional' : 'Paciente'}</th><th>Estado</th><th style="text-align:center;">Acción</th>
              </tr>
            </thead>
            <tbody>${filasHTML}</tbody>
          </table>
        </div>
      </div>
    </div></div>
  `);
}