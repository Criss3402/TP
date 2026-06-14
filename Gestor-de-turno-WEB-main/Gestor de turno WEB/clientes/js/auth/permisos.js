/* =========================================================================
   SISTEMA DE ROLES Y PERMISOS
========================================================================= */
const ROLES = {
    ADMIN: 'ADMIN',
    DOCTOR: 'DOCTOR',
    PACIENTE: 'PACIENTE',
    RECEPCIONISTA: 'RECEPCIONISTA'
};

const PERMISOS_VISTAS = {
   [ROLES.ADMIN]: ['dashboard', 'usuarios', 'gestion_medicos', 'gestion_pacientes', 'historial_admin', 'todos_turnos', 'estadisticas', 'gestionar_esp', 'agenda', 'pagos', 'suspensiones'],
    [ROLES.RECEPCIONISTA]:  ['dashboard', 'gestion_medicos', 'todos_turnos', 'gestion_pacientes', 'agenda'],
    [ROLES.DOCTOR]:         ['dashboard', 'mis_turnos', 'atencion', 'mi_agenda_doc'],
    [ROLES.PACIENTE]:       ['dashboard', 'mis_turnos', 'nuevo_turno', 'historial']
};

function tienePermiso(rol, vista) {
    return PERMISOS_VISTAS[rol] ? PERMISOS_VISTAS[rol].includes(vista) : false;
}

function filtrarTurnosPorRol(turnos, usuario) {
    if (usuario.rol === ROLES.ADMIN || usuario.rol === ROLES.RECEPCIONISTA) return turnos;
    if (usuario.rol === ROLES.DOCTOR) return turnos.filter(t => t.especialidadId == usuario.especialidadId);
    if (usuario.rol === ROLES.PACIENTE) return turnos.filter(t => t.pacienteNombre === usuario.nombreCompleto);
    return [];
}