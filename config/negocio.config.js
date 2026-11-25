/**
 * Configuración oficial de la regla de negocio parametrizada (N) para TecniSystemas API.
 *
 * Grupo académico: Arquitectura cliente / servidor - Grupo miércoles (CIAF)
 * Integrantes ordenados alfabéticamente por apellido (página 5 del PDF oficial):
 *   1. Combariza Garcia Valentina      -> Lista oficial #4  (determina N)
 *   2. Velez Cardona Johan Alexander   -> Lista oficial #19
 *   3. Zapata Morales Santiago         -> Lista oficial #21
 *
 * Parámetro oficial: N = 4
 * Porcentaje de recargo: N * 2 = 8%
 */

const PARAMETRO_N_CONFIRMADO = true;
const PARAMETRO_N_OFICIAL = 4;

/**
 * Obtiene el valor numérico vigente de N.
 * Por defecto retorna el valor oficial del equipo (N = 4).
 * Permite sobrescribirlo mediante la variable de entorno PARAMETRO_N solo para pruebas.
 * @returns {number} Valor entero positivo de N.
 */
function obtenerParametroN() {
  const desdeEntorno = process.env.PARAMETRO_N;

  if (desdeEntorno !== undefined && desdeEntorno !== '') {
    const numero = Number(desdeEntorno);
    if (Number.isInteger(numero) && numero > 0) {
      return numero;
    }
  }

  return PARAMETRO_N_OFICIAL;
}

/**
 * Calcula el porcentaje de recargo oficial según la fórmula:
 * porcentajeRecargo = N * 2
 * @param {number} [n=obtenerParametroN()]
 * @returns {number} Porcentaje de recargo (8 para N = 4).
 */
function obtenerPorcentajeRecargo(n = obtenerParametroN()) {
  return n * 2;
}

module.exports = {
  PARAMETRO_N_CONFIRMADO,
  PARAMETRO_N_OFICIAL,
  obtenerParametroN,
  obtenerPorcentajeRecargo
};
