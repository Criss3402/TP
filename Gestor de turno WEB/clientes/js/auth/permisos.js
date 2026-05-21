/* =========================================================================
   SISTEMA DE ROLES Y PERMISOS
========================================================================= */
const ROLES = {
    ADMIN: 'ADMIN',
    DOCTOR: 'DOCTOR',
    PACIENTE: 'PACIENTE'
};

// Definimos a qué "pantallas" puede entrar cada rol

const PERMISOS_VISTAS = {
    [ROLES.ADMIN]: ['dashboard', 'usuarios', 'todos_turnos', 'estadisticas', 'gestionar_esp', 'agenda', 'pagos', 'suspensiones'],
    [ROLES.DOCTOR]: ['dashboard', 'mis_turnos', 'atencion', 'mi_agenda_doc'], // Agregado 'mi_agenda_doc'
    [ROLES.PACIENTE]: ['dashboard', 'mis_turnos', 'nuevo_turno', 'historial']
};

// Verifica si el usuario actual puede abrir la sección solicitada
function tienePermiso(rol, vista) {
    return PERMISOS_VISTAS[rol] ? PERMISOS_VISTAS[rol].includes(vista) : false;
}

// Filtra la lista de turnos según quién los está mirando
function filtrarTurnosPorRol(turnos, usuario) {
    if (usuario.rol === ROLES.ADMIN) {
        return turnos; // El admin ve todo
    }
    if (usuario.rol === ROLES.DOCTOR) {
        // El doc solo ve los turnos de su especialidad
        return turnos.filter(t => t.especialidadId == usuario.especialidadId);
    }
    if (usuario.rol === ROLES.PACIENTE) {
        // El paciente solo ve los suyos propios
        return turnos.filter(t => t.pacienteNombre === usuario.nombreCompleto);
    }
    return [];
}
