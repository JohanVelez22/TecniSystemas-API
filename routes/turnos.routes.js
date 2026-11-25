const express = require('express');
const turnosController = require('../controllers/turnos.controller');

const router = express.Router();

// Endpoint 1: Listar todos los turnos registrados
router.get('/', turnosController.listarTurnos);

// Endpoint 2: Consultar un turno específico por identificador
router.get('/:id', turnosController.obtenerTurnoPorId);

// Endpoint 3: Registrar una nueva solicitud de turno
router.post('/', turnosController.crearTurno);

module.exports = router;

