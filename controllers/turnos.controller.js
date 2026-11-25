const turnosService = require('../services/turnos.service');

/**
 * Valida que una cadena de fecha/hora tenga formato ISO válido (YYYY-MM-DD,
 * YYYY-MM-DDTHH:mm, YYYY-MM-DD HH:mm o con segundos/zona horaria) y represente
 * una fecha real en el calendario.
 * @param {unknown} valor
 * @returns {boolean}
 */
function esFechaHoraValida(valor) {
  if (typeof valor !== 'string') {
    return false;
  }

  const texto = valor.trim();
  const patron = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/;
  const coincidencia = patron.exec(texto);

  if (!coincidencia) {
    return false;
  }

  const anio = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);
  const hora = coincidencia[4] !== undefined ? Number(coincidencia[4]) : 0;
  const minuto = coincidencia[5] !== undefined ? Number(coincidencia[5]) : 0;
  const segundo = coincidencia[6] !== undefined ? Number(coincidencia[6]) : 0;

  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
    return false;
  }

  if (hora > 23 || minuto > 59 || segundo > 59) {
    return false;
  }

  // Verificar que la fecha exista realmente en el calendario (evitar 2026-02-31)
  const fechaVerificacion = new Date(Date.UTC(anio, mes - 1, dia));
  if (
    fechaVerificacion.getUTCFullYear() !== anio ||
    fechaVerificacion.getUTCMonth() !== mes - 1 ||
    fechaVerificacion.getUTCDate() !== dia
  ) {
    return false;
  }

  return true;
}

/**
 * Valida los datos de entrada para crear una solicitud de turno.
 * Retorna un mensaje de error en español si existe algún problema, o null si es válido.
 * @param {unknown} cuerpo
 * @returns {string|null}
 */
function validarDatosTurno(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    return 'El cuerpo de la petición debe ser un objeto JSON válido';
  }

  if (Object.keys(cuerpo).length === 0) {
    return 'El cuerpo de la petición no puede estar vacío';
  }

  const {
    nombreCliente,
    tipoServicio,
    descripcion,
    fechaHora,
    precioBase,
    prioritario
  } = cuerpo;

  if (typeof nombreCliente !== 'string' || nombreCliente.trim().length === 0) {
    return 'El campo nombreCliente es obligatorio y debe ser un texto no vacío';
  }

  if (typeof tipoServicio !== 'string' || tipoServicio.trim().length < 3) {
    return 'El campo tipoServicio es obligatorio y debe ser un texto válido de al menos 3 caracteres';
  }

  if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
    return 'El campo descripcion debe ser una cadena de texto cuando se proporciona';
  }

  if (descripcion === null) {
    return 'El campo descripcion no puede ser nulo; omítalo o envíe una cadena de texto';
  }

  if (fechaHora === undefined || fechaHora === null || !esFechaHoraValida(fechaHora)) {
    return 'El campo fechaHora es obligatorio y debe tener un formato de fecha válido (ejemplo: 2026-11-26T10:00)';
  }

  if (typeof precioBase !== 'number' || !Number.isFinite(precioBase) || precioBase <= 0) {
    return 'El precio base debe ser un número mayor que cero';
  }

  if (prioritario !== undefined && typeof prioritario !== 'boolean') {
    return 'El campo prioritario debe ser un valor booleano (true o false)';
  }

  return null;
}

/**
 * GET /api/turnos
 * Retorna todos los turnos almacenados con código HTTP 200 OK.
 */
function listarTurnos(req, res, next) {
  try {
    const turnos = turnosService.listarTurnos();
    return res.status(200).json(turnos);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/turnos/:id
 * Busca un turno por su identificador.
 * Retorna 200 OK si existe, 404 Not Found si no existe o el identificador no corresponde a ningún registro.
 */
function obtenerTurnoPorId(req, res, next) {
  try {
    const idTexto = req.params.id;
    const esEnteroPositivo = /^\d+$/.test(idTexto);

    if (!esEnteroPositivo) {
      return res.status(404).json({
        error: `No se encontró un turno con el identificador '${idTexto}'`
      });
    }

    const id = Number(idTexto);
    const turno = turnosService.obtenerTurnoPorId(id);

    if (!turno) {
      return res.status(404).json({
        error: `No se encontró un turno con el identificador ${id}`
      });
    }

    return res.status(200).json(turno);
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/turnos
 * Valida la solicitud, delega el cálculo y almacenamiento a la capa de servicios
 * y responde con 201 Created o 400 Bad Request.
 */
function crearTurno(req, res, next) {
  try {
    const mensajeError = validarDatosTurno(req.body);

    if (mensajeError) {
      return res.status(400).json({ error: mensajeError });
    }

    const nuevoTurno = turnosService.crearTurno(req.body);
    return res.status(201).json(nuevoTurno);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listarTurnos,
  obtenerTurnoPorId,
  crearTurno
};

