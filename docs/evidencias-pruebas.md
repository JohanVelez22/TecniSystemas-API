# Evidencias de Pruebas Funcionales — TecniSystemas API

## 1. Información de Ejecución

- **Fecha de ejecución:** 2026-11-25
- **Entorno:** Windows / Node.js `v23.11.1` / npm `10.9.2`
- **Comando ejecutado:** `npm test` (`node --test tests/turnos.test.js`)
- **Grupo académico:** Grupo miércoles — CIAF
- **Integrantes (orden alfabético por apellido):**
  1. Combariza Garcia Valentina (#4) — *determina `N`*
  2. Velez Cardona Johan Alexander (#19)
  3. Zapata Morales Santiago (#21)
- **Parámetro `N` oficial:** `N = 4`
- **Porcentaje de recargo oficial:** `8%` (`4 * 2`)
- **Resultado global:** `10 / 10` pruebas aprobadas (`0` fallos, duración `942 ms`)

---

## 2. Matriz de Resultados por Caso de Prueba

| # | Caso de prueba | Entrada utilizada | Código HTTP obtenido | Resultado esperado | Resultado observado | Estado |
|---|---|---|---|---|---|---|
| 1 | Listar solicitudes vacías | `GET /api/turnos` | `200` | Lista JSON vacía `[]` | Arreglo JSON `[]` | APROBADA |
| 2 | Crear solicitud válida y persistir | `POST /api/turnos` con `nombreCliente`, `tipoServicio`, `descripcion`, `fechaHora`, `precioBase: 80000`, `prioritario: false` | `201` | ID generado (`1`), `totalPagar: 80000`, persistido en `GET /api/turnos` | `id: 1`, `porcentajeRecargo: 0`, `totalPagar: 80000`; `GET /api/turnos` retorna 1 elemento | APROBADA |
| 3 | Calcular prioridad (`N = 4`, `8%`) | `POST /api/turnos` con `precioBase: 100000`, `prioritario: true` (e intento de inyectar `totalPagar: 1`) | `201` | Recargo `N * 2` (`8%`), `totalPagar: 108000`, ignorando valores del cliente | `porcentajeRecargo: 8`, `totalPagar: 108000` | APROBADA |
| 4 | Sin prioridad (`false`) | `POST /api/turnos` con `precioBase: 65000`, `prioritario: false` | `201` | `porcentajeRecargo: 0`, `totalPagar: 65000` | `porcentajeRecargo: 0`, `totalPagar: 65000` | APROBADA |
| 5 | Prioridad omitida | `POST /api/turnos` sin campo `prioritario`, `precioBase: 90000` | `201` | `prioritario: false`, `porcentajeRecargo: 0`, `totalPagar: 90000` | `prioritario: false`, `porcentajeRecargo: 0`, `totalPagar: 90000` | APROBADA |
| 6 | Precio inválido (`0` y `-50000`) | `POST /api/turnos` con `precioBase: 0` y luego `precioBase: -50000` | `400` | Rechazo con mensaje JSON descriptivo en español | `400` con `{ "error": "El precio base debe ser un número mayor que cero" }` | APROBADA |
| 7 | Campo faltante, tipos inválidos y JSON mal formado | `POST /api/turnos` sin `nombreCliente`, cuerpo `{}`, fecha `"mañana a las 3"`, `prioritario: "si"`, y JSON roto | `400` | Rechazo controlado con mensaje JSON claro | Todos los casos retornaron `400` con `error` en JSON | APROBADA |
| 8 | Consultar ID existente | `GET /api/turnos/1` tras crear registro | `200` | Objeto JSON del turno creado | Objeto con `id: 1`, `nombreCliente: "Diana Castro"` | APROBADA |
| 9 | Consultar ID inexistente / mal formado | `GET /api/turnos/9999` y `GET /api/turnos/abc` | `404` | Mensaje JSON descriptivo | Ambos retornaron `404` con mensaje `error` en JSON | APROBADA |
| 10 | Continuidad del servidor | Peticiones inválidas seguidas de `GET /api/turnos` | `200` | El servidor sigue operativo sin caerse | `GET /api/turnos` respondió `200` con arreglo JSON | APROBADA |

---

## 3. Salida Real de Pruebas Automatizadas (`npm test`)

```text
> tecnisystemas-api@1.0.0 test
> node --test tests/turnos.test.js

▶ TecniSystemas API - Pruebas Funcionales Obligatorias
  ✔ Prueba 1 — Listar solicitudes cuando no hay registros (GET /api/turnos -> 200) (94.3996ms)
  ✔ Prueba 2 — Crear solicitud válida y verificar persistencia (POST /api/turnos -> 201) (50.8372ms)
  ✔ Prueba 3 — Calcular recargo oficial N = 4 (8%) con atención prioritaria (prioritario: true) (13.0184ms)
  ✔ Prueba 4 — Solicitud sin prioridad (prioritario: false) (25.8707ms)
  ✔ Prueba 5 — Solicitud con atributo prioritario omitido (23.5852ms)
  ✔ Prueba 6 — Rechazar precioBase igual a cero o negativo (POST -> 400) (22.88ms)
  ✔ Prueba 7 — Rechazar campo obligatorio faltante y tipos inválidos (POST -> 400) (34.5448ms)
  ✔ Prueba 8 — Consultar turno existente por ID (GET /api/turnos/:id -> 200) (26.189ms)
  ✔ Prueba 9 — Consultar turno inexistente por ID (GET /api/turnos/:id -> 404) (8.1717ms)
  ✔ Prueba 10 — Continuidad del servidor después de múltiples solicitudes inválidas (14.333ms)
✔ TecniSystemas API - Pruebas Funcionales Obligatorias (367.6097ms)
ℹ tests 10
ℹ suites 1
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 942.0208
```

---

## 4. Evidencia Real de Ejecución del Servidor (`http://localhost:3000`)

```json
{
  "getListStatus": 200,
  "postValidStatus": 201,
  "created": {
    "id": 1,
    "nombreCliente": "Laura Ríos",
    "tipoServicio": "Reparación de hardware",
    "descripcion": "Cambio de pantalla urgente",
    "fechaHora": "2026-11-26T14:30",
    "precioBase": 100000,
    "prioritario": true,
    "porcentajeRecargo": 8,
    "totalPagar": 108000,
    "fechaRegistro": "2026-11-25T19:03:06.122Z"
  },
  "getByIdStatus": 200,
  "post400Status": 400,
  "post400Body": {
    "error": "El precio base debe ser un número mayor que cero"
  },
  "get404Status": 404,
  "get404Body": {
    "error": "No se encontró un turno con el identificador 9999"
  }
}
```
