const path = require('path');
const express = require('express');
const turnosRoutes = require('./routes/turnos.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar cuerpos JSON
app.use(express.json());

// Interfaz web interactiva para probar la API desde el navegador
app.use(express.static(path.join(__dirname, 'public')));

// Control de JSON mal formado en el cuerpo de la petición
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'El cuerpo de la petición contiene un JSON mal formado'
    });
  }
  return next(err);
});

// Conexión de rutas principales
app.use('/api/turnos', turnosRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  return res.status(404).json({
    error: `La ruta ${req.method} ${req.originalUrl} no existe en esta API`
  });
});

// Manejo centralizado de errores inesperados sin exponer detalles internos
app.use((err, req, res, next) => {
  return res.status(500).json({
    error: 'Ocurrió un error interno al procesar la solicitud'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor TecniSystemas API escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;

