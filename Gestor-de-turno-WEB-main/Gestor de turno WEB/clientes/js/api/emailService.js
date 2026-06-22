// ─── Configuración de EmailJS ──────────────────────────────────────────────
const EMAILJS_PUBLIC_KEY  = 'piELV0BO-3PZ3flsS';
const EMAILJS_SERVICE_ID  = 'service_v267smr';
const EMAILJS_TEMPLATE_TURNO     = 'template_qfbttrg';
const EMAILJS_TEMPLATE_BIENVENIDA = 'template_0t1dqxv';

// Inicializar EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

const emailService = {

  /**
   * Envía email de confirmación de turno al paciente.
   * @param {Object} datos
   * @param {string} datos.to_email   - Email del paciente
   * @param {string} datos.to_name    - Nombre del paciente
   * @param {string} datos.especialidad
   * @param {string} datos.doctor     - Nombre completo del médico
   * @param {string} datos.fecha
   * @param {string} datos.hora
   * @param {number} datos.turno_id
   */
  enviarConfirmacionTurno: async (datos) => {
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_TURNO, {
        to_email:     datos.to_email,
        to_name:      datos.to_name,
        especialidad: datos.especialidad,
        doctor:       datos.doctor,
        fecha:        datos.fecha,
        hora:         datos.hora,
        turno_id:     datos.turno_id
      });
      console.log('✅ Email de confirmación de turno enviado a', datos.to_email);
      return { success: true };
    } catch (err) {
      console.error('❌ Error al enviar email de turno:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Envía email de bienvenida al nuevo paciente.
   * @param {Object} datos
   * @param {string} datos.to_email - Email del paciente
   * @param {string} datos.to_name  - Nombre completo
   */
  enviarBienvenida: async (datos) => {
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_BIENVENIDA, {
        to_email: datos.to_email,
        to_name:  datos.to_name
      });
      console.log('✅ Email de bienvenida enviado a', datos.to_email);
      return { success: true };
    } catch (err) {
      console.error('❌ Error al enviar email de bienvenida:', err);
      return { success: false, error: err };
    }
  }
};
