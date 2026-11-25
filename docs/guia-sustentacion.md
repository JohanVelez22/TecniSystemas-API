# Guía de Sustentación — TecniSystemas API

Este documento prepara a todos los integrantes del equipo para explicar cualquier capa del proyecto, ejecutar la demostración en vivo y responder las preguntas técnicas del docente.

---

## Parte A — Introducción

**TecniSystemas API** es una API REST desarrollada en Node.js y Express que gestiona solicitudes de servicio técnico y reparación de computadores. Permite registrar turnos de atención, listarlos, consultarlos por identificador y calcular automáticamente el valor total a pagar aplicando un recargo cuando la solicitud es prioritaria.

---

## Parte B — Arquitectura por Capas

El sistema aplica una separación estricta en capas para mantener el código ordenado, mantenible y fácil de probar:

1. **`index.js`:** Punto de entrada. Inicializa Express, activa `express.json()`, controla JSON mal formado, conecta `/api/turnos` y levanta el servidor.
2. **`routes/turnos.routes.js`:** Define únicamente las rutas HTTP (`GET /`, `GET /:id`, `POST /`) y las conecta con su controlador. No contiene cálculos ni validaciones.
3. **`controllers/turnos.controller.js`:** Recibe la petición (`req`), valida campos obligatorios, tipos de datos y formatos, invoca a la capa de servicios y devuelve la respuesta (`res`) con el código HTTP correcto (`200`, `201`, `400`, `404`).
4. **`services/turnos.service.js`:** Contiene la lógica de negocio: aplica el parámetro `N`, calcula `porcentajeRecargo` y `totalPagar`, genera identificadores únicos y lee/escribe en `data/turnos.json`.

### Flujo de una petición HTTP
`Cliente HTTP` → `index.js` → `routes/turnos.routes.js` → `controllers/turnos.controller.js` → `services/turnos.service.js` → `data/turnos.json` → respuesta JSON al cliente.

---

## Parte C — Endpoints Obligatorios

1. **`GET /api/turnos`:** Devuelve el arreglo completo de solicitudes almacenadas con código `200 OK` (si no hay registros, retorna `[]`).
2. **`GET /api/turnos/:id`:** Busca un turno por su `id`. Devuelve `200 OK` con el objeto encontrado o `404 Not Found` con un mensaje JSON claro si no existe.
3. **`POST /api/turnos`:** Recibe un JSON en `req.body`, valida los campos obligatorios y tipos, delega el cálculo de tarifa y el guardado a `services/`, y responde `201 Created` con el turno creado (o `400 Bad Request` si algún dato es inválido).

*(Nota teórica: en una API CRUD completa, `PUT` reemplazaría un recurso completo, `PATCH` actualizaría campos parciales y `DELETE` eliminaría un registro; no se implementan aquí porque el taller exige estrictamente los tres endpoints anteriores).*

---

## Parte D — Regla de Negocio Parametrizada (N = 4)

- **Origen de `N`:** Al ordenar alfabéticamente por apellido a los integrantes del **Grupo miércoles** según la página 5 del PDF oficial:
  1. **Combariza Garcia Valentina** — Lista oficial **#4** *(determina `N`)*
  2. **Velez Cardona Johan Alexander** — Lista oficial **#19**
  3. **Zapata Morales Santiago** — Lista oficial **#21**
- **Valor oficial:** `N = 4` (definido en `config/negocio.config.js`).
- **Fórmula del porcentaje:** `porcentajeRecargo = N * 2 = 4 * 2 = 8%`.
- **Fórmula del total:**
  - Si `prioritario === true`: `totalPagar = precioBase + (precioBase * (8 / 100))` (ejemplo: `100000 -> 108000`).
  - Si `prioritario === false` o no se envía: `totalPagar = precioBase` (ejemplo: `100000 -> 100000`).
- **Dónde vive la regla:** Exclusivamente en `services/turnos.service.js` (`calcularTarifa`), ignorando cualquier `porcentajeRecargo` o `totalPagar` que un cliente intente enviar en el JSON.

---

## Parte E — Validaciones y Códigos HTTP

| Código | Significado | Cuándo se devuelve |
|---|---|---|
| `200` | OK | `GET /api/turnos` exitoso o `GET /api/turnos/:id` encontrado |
| `201` | Created | `POST /api/turnos` crea y guarda una solicitud válida |
| `400` | Bad Request | Faltan campos obligatorios, `precioBase <= 0`, tipos incorrectos, fecha inválida, cuerpo vacío o JSON mal formado |
| `404` | Not Found | Se consulta un `id` inexistente o una ruta no definida |

---

## Parte F — Secuencia Reproducible de Demostración en Vivo

1. **Abrir terminal** en la raíz del proyecto.
2. **Instalar dependencias (si falta `node_modules`):**
   ```bash
   npm install
   ```
3. **Iniciar el servidor:**
   ```bash
   npm start
   ```
4. **Consultar lista inicial de turnos (`200 OK`):**
   ```bash
   curl -i http://localhost:3000/api/turnos
   ```
5. **Crear una solicitud prioritaria (`201 Created`):**
   ```bash
   curl -i -X POST http://localhost:3000/api/turnos -H "Content-Type: application/json" -d "{\"nombreCliente\":\"Laura Ríos\",\"tipoServicio\":\"Reparación de hardware\",\"descripcion\":\"Cambio de pantalla\",\"fechaHora\":\"2026-11-26T14:30\",\"precioBase\":100000,\"prioritario\":true}"
   ```
6. **Consultar el registro creado (`200 OK`):**
   ```bash
   curl -i http://localhost:3000/api/turnos/1
   ```
7. **Demostrar error `400 Bad Request` (`precioBase: 0`):**
   ```bash
   curl -i -X POST http://localhost:3000/api/turnos -H "Content-Type: application/json" -d "{\"nombreCliente\":\"Pedro Ruiz\",\"tipoServicio\":\"Diagnóstico\",\"fechaHora\":\"2026-11-27T10:00\",\"precioBase\":0}"
   ```
8. **Demostrar error `404 Not Found` (`id` inexistente):**
   ```bash
   curl -i http://localhost:3000/api/turnos/9999
   ```
9. **Explicar la regla de negocio:** abrir `services/turnos.service.js` y `config/negocio.config.js`, mostrar `calcularTarifa` y comprobar la fórmula con el resultado del paso 5.
10. **Mostrar la estructura del proyecto:** abrir `index.js`, `routes/turnos.routes.js`, `controllers/turnos.controller.js` y `services/turnos.service.js`.

---

## Parte G — Preguntas Probables del Profesor y Respuestas Modelo

1. **¿Qué es una API REST?**
   Es una interfaz de programación que expone recursos mediante URLs y utiliza los métodos estándar del protocolo HTTP (`GET`, `POST`, etc.) y códigos de estado para intercambiar datos, generalmente en formato JSON, sin mantener estado de sesión entre peticiones.
2. **¿Qué significa arquitectura cliente-servidor?**
   Es un modelo donde las responsabilidades se dividen en dos partes: el **cliente** (navegador, Postman, curl o app) envía peticiones, y el **servidor** (nuestra API en Node.js/Express) procesa la lógica, gestiona los datos y devuelve respuestas estructuradas.
3. **¿Qué es un endpoint?**
   Es una dirección específica combinada con un método HTTP que expone una operación concreta de la API, por ejemplo `POST /api/turnos` o `GET /api/turnos/:id`.
4. **¿Para qué sirve Express?**
   Es un framework minimalista para Node.js que facilita crear servidores HTTP, definir rutas, usar middlewares (como `express.json()`) y responder con códigos de estado y JSON de forma ordenada.
5. **¿Qué es `req.body`?**
   Es el objeto que contiene los datos enviados en el cuerpo de una petición HTTP (por ejemplo en un `POST`). En nuestro proyecto lo interpreta automáticamente el middleware `express.json()`.
6. **¿Qué función cumple `routes/`?**
   Define exclusivamente las URLs y métodos HTTP disponibles y los enlaza con la función correspondiente del controlador. No ejecuta validaciones ni lógica de negocio.
7. **¿Qué función cumple `controllers/`?**
   Actúa como intermediario HTTP: recibe `req` y `res`, valida los datos de entrada, invoca a `services/` y retorna la respuesta JSON con el código HTTP adecuado (`200`, `201`, `400`, `404`).
8. **¿Qué función cumple `services/`?**
   Concentra la lógica de negocio y la gestión de datos: calcula el recargo según `N`, determina `totalPagar`, asigna el `id` y lee/escribe el archivo `data/turnos.json`.
9. **¿Por qué no se hacen los cálculos en `routes/`?**
   Porque violaría la separación de responsabilidades: las rutas solo deben mapear URLs. Mezclar lógica de negocio en `routes/` hace el código difícil de mantener, reutilizar y probar.
10. **¿Qué significa HTTP 201?**
    `201 Created` indica que la petición fue exitosa y que como resultado se creó un nuevo recurso en el servidor (en nuestro caso, un nuevo turno).
11. **¿Cuándo corresponde HTTP 400?**
    `400 Bad Request` corresponde cuando el cliente envía datos inválidos o incompletos: campos obligatorios faltantes, `precioBase <= 0`, tipos incorrectos, fecha con formato inválido o JSON mal formado.
12. **¿Cuándo corresponde HTTP 404?**
    `404 Not Found` corresponde cuando el recurso solicitado no existe, por ejemplo al consultar `GET /api/turnos/9999` o una ruta no definida en la API.
13. **¿Cómo se determina `N`?**
    Se ordenan los integrantes del equipo alfabéticamente por apellido usando la lista oficial del grupo (página 5 del taller) y se toma el número de lista oficial del primer integrante.
14. **¿Cómo se calcula el recargo?**
    Se multiplica `N * 2` para obtener `porcentajeRecargo`. Si `prioritario === true`, se suma `precioBase * (porcentajeRecargo / 100)` al `precioBase`; si es `false` o se omite, el recargo es `0` y `totalPagar = precioBase`.
15. **¿Dónde se guardan los datos?**
    En un archivo JSON local ubicado en `data/turnos.json`, administrado exclusivamente desde `services/turnos.service.js`.
16. **¿Qué ocurre cuando se reinicia el servidor?**
    Gracias a la persistencia en `data/turnos.json`, los turnos registrados anteriormente se conservan y siguen disponibles al consultar `GET /api/turnos`.
17. **¿Cómo se controla un registro inexistente?**
    En `controllers/turnos.controller.js`, si el `id` no es un entero positivo válido o `turnosService.obtenerTurnoPorId(id)` retorna `null`, se responde `404 Not Found` con un mensaje JSON descriptivo en español sin detener el servidor.

