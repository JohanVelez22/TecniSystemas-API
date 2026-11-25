const fs = require('fs');
const path = require('path');
const {
  obtenerParametroN,
  obtenerPorcentajeRecargo
} = require('../config/negocio.config');

const RUTA_DATOS_POR_DEFECTO = path.join(__dirname, '..', 'data', 'turnos.json');

/**
 * Obtiene la ruta del archivo JSON donde se persisten los turnos.
 * Permite sobrescribirla mediante TURNOS_DATA_FILE para aislar pruebas automatizadas.
 * @returns {string}
 */
function obtenerRutaDatos() {
  return process.env.TURNOS_DATA_FILE
    ? path.resolve(process.env.TURNOS_DATA_FILE)
    : RUTA_DATOS_POR_DEFECTO;
}

/**
 * Garantiza que exista el directorio y el archivo JSON inicializado como arreglo vacío.
 * @param {string} rutaArchivo
 */
function asegurarArchivoDatos(rutaArchivo) {
  const directorio = path.dirname(rutaArchivo);
  if (!fs.existsSync(directorio)) {
    fs.mkdirSync(directorio, { recursive: true });
  }

  if (!fs.existsSync(rutaArchivo)) {
    fs.writeFileSync(rutaArchivo, '[]\n', 'utf8');
  }
}

/**
 * Lee todos los registros almacenados en el archivo JSON local.
 * Si el archivo está vacío, retorna un arreglo vacío.
 * @returns {Array<Object>}
 */
function leerTurnos() {
  const rutaArchivo = obtenerRutaDatos();
  asegurarArchivoDatos(rutaArchivo);

  const contenido = fs.readFileSync(rutaArchivo, 'utf8').trim();
  if (!contenido) {
    return [];
  }

  const datos = JSON.parse(contenido);
  if (!Array.isArray(datos)) {
    throw new Error('La estructura del archivo de almacenamiento debe ser un arreglo JSON.');
  }

  return datos;
}

/**
 * Guarda el arreglo completo de turnos en el archivo JSON local.
 * @param {Array<Object>} turnos
 */
function guardarTurnos(turnos) {
  const rutaArchivo = obtenerRutaDatos();
  asegurarArchivoDatos(rutaArchivo);
  fs.writeFileSync(rutaArchivo, `${JSON.stringify(turnos, null, 2)}\n`, 'utf8');
}

/**
 * Redondea valores monetarios de forma consistente a dos decimales.
 * @param {number} valor
 * @returns {number}
 */
function redondearMoneda(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula la tarifa final aplicando la regla de negocio parametrizada (N):
 * - porcentajeRecargo = N * 2
 * - Si prioritario === true: totalPagar = precioBase + (precioBase * (porcentajeRecargo / 100))
 * - Si prioritario === false (o no especificado): totalPagar = precioBase
 *
 * @param {number} precioBase
 * @param {boolean} prioritario
 * @returns {{ parametroN: number, porcentajeRecargo: number, totalPagar: number }}
 */
function calcularTarifa(precioBase, prioritario) {
  const parametroN = obtenerParametroN();
  const baseRedondeada = redondearMoneda(precioBase);

  if (prioritario === true) {
    const porcentajeRecargo = obtenerPorcentajeRecargo(parametroN);
    const totalPagar = redondearMoneda(
      baseRedondeada + baseRedondeada * (porcentajeRecargo / 100)
    );

    return {
      parametroN,
      porcentajeRecargo,
      totalPagar
    };
  }

  return {
    parametroN,
    porcentajeRecargo: 0,
    totalPagar: baseRedondeada
  };
}

/**
 * Genera el siguiente identificador numérico secuencial evitando colisiones.
 * @param {Array<Object>} turnos
 * @returns {number}
 */
function generarSiguienteId(turnos) {
  if (turnos.length === 0) {
    return 1;
  }

  const maxId = turnos.reduce((maximo, turno) => {
    const idNumerico = Number(turno.id);
    return Number.isInteger(idNumerico) && idNumerico > maximo ? idNumerico : maximo;
  }, 0);

  return maxId + 1;
}

/**
 * Retorna la lista completa de turnos almacenados.
 * @returns {Array<Object>}
 */
function listarTurnos() {
  return leerTurnos();
}

/**
 * Busca un turno por su identificador único.
 * @param {number} id
 * @returns {Object|null}
 */
function obtenerTurnoPorId(id) {
  const turnos = leerTurnos();
  const turnoEncontrado = turnos.find((turno) => turno.id === id);
  return turnoEncontrado || null;
}

/**
 * Crea y persiste una nueva solicitud de servicio técnico aplicando la regla de negocio.
 * El servidor determina el recargo y el total a pagar; nunca se confía en valores enviados por el cliente.
 *
 * @param {Object} datosEntrada
 * @returns {Object} Turno creado.
 */
function crearTurno(datosEntrada) {
  const turnos = leerTurnos();
  const prioritario = datosEntrada.prioritario === true;
  const precioBase = redondearMoneda(datosEntrada.precioBase);
  const { porcentajeRecargo, totalPagar } = calcularTarifa(precioBase, prioritario);

  const nuevoTurno = {
    id: generarSiguienteId(turnos),
    nombreCliente: datosEntrada.nombreCliente.trim(),
    tipoServicio: datosEntrada.tipoServicio.trim(),
    descripcion: typeof datosEntrada.descripcion === 'string' ? datosEntrada.descripcion.trim() : '',
    fechaHora: datosEntrada.fechaHora.trim(),
    precioBase,
    prioritario,
    porcentajeRecargo,
    totalPagar,
    fechaRegistro: new Date().toISOString()
  };

  turnos.push(nuevoTurno);
  guardarTurnos(turnos);

  return nuevoTurno;
}

module.exports = {
  listarTurnos,
  obtenerTurnoPorId,
  crearTurno,
  calcularTarifa,
  redondearMoneda
};

