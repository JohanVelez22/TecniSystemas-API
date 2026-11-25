const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

// Usar un archivo JSON aislado para las pruebas automatizadas
const RUTA_PRUEBAS = path.join(__dirname, '..', 'data', 'turnos.test.json');
process.env.TURNOS_DATA_FILE = RUTA_PRUEBAS;

const app = require('../index');
const {
  obtenerParametroN,
  obtenerPorcentajeRecargo
} = require('../config/negocio.config');

let servidor;
let baseUrl;

/**
 * Ejecuta una petición HTTP contra el servidor local de pruebas.
 */
async function peticion(metodo, ruta, cuerpo = undefined, encabezados = {}) {
  const opciones = {
    method: metodo,
    headers: { ...encabezados }
  };

  if (cuerpo !== undefined) {
    if (typeof cuerpo === 'string') {
      opciones.body = cuerpo;
      if (!opciones.headers['Content-Type']) {
        opciones.headers['Content-Type'] = 'application/json';
      }
    } else {
      opciones.body = JSON.stringify(cuerpo);
      opciones.headers['Content-Type'] = 'application/json';
    }
  }

  const respuesta = await fetch(`${baseUrl}${ruta}`, opciones);
  const texto = await respuesta.text();
  let json = null;

  try {
    json = JSON.parse(texto);
  } catch {
    json = null;
  }

  return {
    status: respuesta.status,
    json,
    texto
  };
}

describe('TecniSystemas API - Pruebas Funcionales Obligatorias', () => {
  before(async () => {
    fs.writeFileSync(RUTA_PRUEBAS, '[]\n', 'utf8');
    servidor = http.createServer(app);
    await new Promise((resolve) => {
      servidor.listen(0, '127.0.0.1', () => {
        const { port } = servidor.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => servidor.close(resolve));
    if (fs.existsSync(RUTA_PRUEBAS)) {
      fs.unlinkSync(RUTA_PRUEBAS);
    }
  });

  beforeEach(() => {
    fs.writeFileSync(RUTA_PRUEBAS, '[]\n', 'utf8');
  });

  it('Prueba 1 — Listar solicitudes cuando no hay registros (GET /api/turnos -> 200)', async () => {
    const res = await peticion('GET', '/api/turnos');

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.json));
    assert.equal(res.json.length, 0);
  });

  it('Prueba 2 — Crear solicitud válida y verificar persistencia (POST /api/turnos -> 201)', async () => {
    const entrada = {
      nombreCliente: 'Carlos Mendoza',
      tipoServicio: 'Mantenimiento preventivo',
      descripcion: 'Limpieza interna y cambio de pasta térmica de portátil',
      fechaHora: '2026-11-26T10:00',
      precioBase: 80000,
      prioritario: false
    };

    const res = await peticion('POST', '/api/turnos', entrada);

    assert.equal(res.status, 201);
    assert.equal(res.json.id, 1);
    assert.equal(res.json.nombreCliente, 'Carlos Mendoza');
    assert.equal(res.json.tipoServicio, 'Mantenimiento preventivo');
    assert.equal(res.json.precioBase, 80000);
    assert.equal(res.json.prioritario, false);
    assert.equal(res.json.porcentajeRecargo, 0);
    assert.equal(res.json.totalPagar, 80000);

    // Verificar persistencia en GET /api/turnos
    const lista = await peticion('GET', '/api/turnos');
    assert.equal(lista.status, 200);
    assert.equal(lista.json.length, 1);
    assert.equal(lista.json[0].id, 1);
  });

  it('Prueba 3 — Calcular recargo oficial N = 4 (8%) con atención prioritaria (prioritario: true)', async () => {
    const nActual = obtenerParametroN();
    const recargoEsperado = obtenerPorcentajeRecargo(nActual);
    assert.equal(nActual, 4);
    assert.equal(recargoEsperado, 8);

    const precioBase = 100000;
    const totalEsperado = 108000;

    const entrada = {
      nombreCliente: 'Laura Ríos',
      tipoServicio: 'Reparación de hardware',
      descripcion: 'Cambio de pantalla urgente',
      fechaHora: '2026-11-26T14:30',
      precioBase,
      prioritario: true,
      // Valores inyectados por cliente que el servidor debe ignorar
      porcentajeRecargo: 0,
      totalPagar: 1
    };

    const res = await peticion('POST', '/api/turnos', entrada);

    assert.equal(res.status, 201);
    assert.equal(res.json.prioritario, true);
    assert.equal(res.json.porcentajeRecargo, recargoEsperado);
    assert.equal(res.json.totalPagar, totalEsperado);
  });

  it('Prueba 4 — Solicitud sin prioridad (prioritario: false)', async () => {
    const entrada = {
      nombreCliente: 'Andrés Gómez',
      tipoServicio: 'Diagnóstico general',
      fechaHora: '2026-11-27T09:00',
      precioBase: 65000,
      prioritario: false
    };

    const res = await peticion('POST', '/api/turnos', entrada);

    assert.equal(res.status, 201);
    assert.equal(res.json.prioritario, false);
    assert.equal(res.json.porcentajeRecargo, 0);
    assert.equal(res.json.totalPagar, 65000);
  });

  it('Prueba 5 — Solicitud con atributo prioritario omitido', async () => {
    const entrada = {
      nombreCliente: 'Sofía Pardo',
      tipoServicio: 'Formateo e instalación de SO',
      fechaHora: '2026-11-27T11:00',
      precioBase: 90000
    };

    const res = await peticion('POST', '/api/turnos', entrada);

    assert.equal(res.status, 201);
    assert.equal(res.json.prioritario, false);
    assert.equal(res.json.porcentajeRecargo, 0);
    assert.equal(res.json.totalPagar, 90000);
  });

  it('Prueba 6 — Rechazar precioBase igual a cero o negativo (POST -> 400)', async () => {
    const resCero = await peticion('POST', '/api/turnos', {
      nombreCliente: 'Pedro Ruiz',
      tipoServicio: 'Mantenimiento preventivo',
      fechaHora: '2026-11-27T15:00',
      precioBase: 0,
      prioritario: true
    });

    assert.equal(resCero.status, 400);
    assert.equal(typeof resCero.json.error, 'string');
    assert.ok(resCero.json.error.length > 0);

    const resNegativo = await peticion('POST', '/api/turnos', {
      nombreCliente: 'Pedro Ruiz',
      tipoServicio: 'Mantenimiento preventivo',
      fechaHora: '2026-11-27T15:00',
      precioBase: -50000,
      prioritario: false
    });

    assert.equal(resNegativo.status, 400);
    assert.equal(typeof resNegativo.json.error, 'string');
  });

  it('Prueba 7 — Rechazar campo obligatorio faltante y tipos inválidos (POST -> 400)', async () => {
    // Falta nombreCliente
    const resFaltante = await peticion('POST', '/api/turnos', {
      tipoServicio: 'Diagnóstico general',
      fechaHora: '2026-11-27T16:00',
      precioBase: 50000
    });
    assert.equal(resFaltante.status, 400);
    assert.equal(typeof resFaltante.json.error, 'string');

    // Cuerpo vacío
    const resVacio = await peticion('POST', '/api/turnos', {});
    assert.equal(resVacio.status, 400);

    // Fecha con formato inválido
    const resFecha = await peticion('POST', '/api/turnos', {
      nombreCliente: 'Ana Torres',
      tipoServicio: 'Diagnóstico general',
      fechaHora: 'mañana a las 3',
      precioBase: 50000
    });
    assert.equal(resFecha.status, 400);

    // prioritario con tipo incorrecto
    const resPrioritario = await peticion('POST', '/api/turnos', {
      nombreCliente: 'Ana Torres',
      tipoServicio: 'Diagnóstico general',
      fechaHora: '2026-11-28T10:00',
      precioBase: 50000,
      prioritario: 'si'
    });
    assert.equal(resPrioritario.status, 400);

    // JSON mal formado
    const resJsonRoto = await peticion('POST', '/api/turnos', '{ "nombreCliente": ');
    assert.equal(resJsonRoto.status, 400);
    assert.equal(typeof resJsonRoto.json.error, 'string');
  });

  it('Prueba 8 — Consultar turno existente por ID (GET /api/turnos/:id -> 200)', async () => {
    const creado = await peticion('POST', '/api/turnos', {
      nombreCliente: 'Diana Castro',
      tipoServicio: 'Actualización de SSD',
      fechaHora: '2026-11-28T08:30',
      precioBase: 120000,
      prioritario: true
    });

    assert.equal(creado.status, 201);

    const consulta = await peticion('GET', `/api/turnos/${creado.json.id}`);
    assert.equal(consulta.status, 200);
    assert.equal(consulta.json.id, creado.json.id);
    assert.equal(consulta.json.nombreCliente, 'Diana Castro');
    assert.equal(consulta.json.totalPagar, creado.json.totalPagar);
  });

  it('Prueba 9 — Consultar turno inexistente por ID (GET /api/turnos/:id -> 404)', async () => {
    const resInexistente = await peticion('GET', '/api/turnos/9999');
    assert.equal(resInexistente.status, 404);
    assert.equal(typeof resInexistente.json.error, 'string');

    const resIdInvalido = await peticion('GET', '/api/turnos/abc');
    assert.equal(resIdInvalido.status, 404);
    assert.equal(typeof resIdInvalido.json.error, 'string');
  });

  it('Prueba 10 — Continuidad del servidor después de múltiples solicitudes inválidas', async () => {
    await peticion('POST', '/api/turnos', '{ json invalido');
    await peticion('POST', '/api/turnos', { precioBase: null });
    await peticion('GET', '/api/turnos/no-existe');

    const res = await peticion('GET', '/api/turnos');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.json));
  });
});

