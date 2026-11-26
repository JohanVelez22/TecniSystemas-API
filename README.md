# TecniSystemas API

API REST por capas desarrollada con **Node.js** y **Express** para la gestión de solicitudes de servicio técnico y reparación de computadores.

---

## 1. Identificación Académica

- **Institución:** Corporación Instituto de Administración y Finanzas — CIAF
- **Programa:** Profesional en Ingeniería de Software
- **Asignatura:** Arquitectura Cliente-Servidor
- **Nombre del proyecto:** TecniSystemas API
- **Grupo académico:** Grupo miércoles
- **Integrantes del equipo (ordenados alfabéticamente por apellido):**

| Orden | N.º Lista Oficial | Apellidos | Nombres |
|---|---|---|---|
| 1 | **4** | Combariza Garcia | Valentina |
| 2 | 19 | Velez Cardona | Johan Alexander |
| 3 | 21 | Zapata Morales | Santiago |

- **Integrante que determina `N`:** Combariza Garcia Valentina (puesto **#4** en el listado oficial del Grupo miércoles)
- **Valor oficial de `N`:** **`4`**
- **Porcentaje de recargo (`N * 2`):** **`8%`**

---

## 2. Contexto del Negocio

### ¿Qué es TecniSystemas?
**TecniSystemas** es un taller especializado en soporte técnico, diagnóstico, mantenimiento y reparación de equipos de cómputo (portátiles y computadores de escritorio).

### ¿Qué problema resuelve?
Centraliza el registro y consulta de turnos o solicitudes de servicio técnico, permitiendo calcular automáticamente el valor final del servicio según si el cliente requiere o no atención prioritaria, evitando cálculos manuales inconsistentes.

### ¿Por qué se seleccionó este contexto?
Se eligió porque representa un negocio real de servicios basado en turnos y solicitudes (tal como propone el taller) donde la atención prioritaria con recargo tiene sentido operativo directo: un equipo que requiere reparación urgente se atiende con prioridad aplicando un porcentaje adicional sobre el precio base.

### Datos de cada solicitud de turno

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | `number` | Generado por el servidor | Identificador único secuencial del turno |
| `nombreCliente` | `string` | Sí | Nombre completo del cliente que solicita el servicio |
| `tipoServicio` | `string` | Sí | Servicio solicitado (ej. Mantenimiento preventivo, Reparación de hardware, Diagnóstico general) |
| `descripcion` | `string` | No | Detalle opcional de la falla o requerimiento del equipo |
| `fechaHora` | `string` | Sí | Fecha y hora de atención en formato ISO (ej. `2026-11-26T10:00`) |
| `precioBase` | `number` | Sí | Costo base del servicio (numérico y mayor que `0`) |
| `prioritario` | `boolean` | No (por defecto `false`) | Indica si la solicitud requiere atención prioritaria |
| `porcentajeRecargo` | `number` | Calculado por el servidor | Porcentaje aplicado (`8` si `prioritario === true`, o `0` en caso contrario) |
| `totalPagar` | `number` | Calculado por el servidor | Valor final a pagar redondeado a dos decimales |
| `fechaRegistro` | `string` | Generado por el servidor | Fecha y hora ISO en que se registró la solicitud |

---

## 3. Arquitectura por Capas

El proyecto sigue estrictamente una arquitectura limpia separada por responsabilidades:

```text
Cliente HTTP
     │
     ▼
  index.js          (Inicializa Express, middleware express.json(), monta rutas y levanta servidor)
     │
     ▼
  routes/           (Define únicamente los endpoints HTTP y los asocia a su controlador)
     │
     ▼
  controllers/      (Gestiona req/res, valida datos de entrada y asigna códigos HTTP 200/201/400/404)
     │
     ▼
  services/         (Ejecuta la regla de negocio N, calcula tarifas y gestiona el almacenamiento)
     │
     ▼
  data/turnos.json  (Persistencia local en archivo JSON)
```

### Estructura de carpetas

```text
Proyecto API REST/
├── index.js
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
├── config/
│   └── negocio.config.js
├── routes/
│   └── turnos.routes.js
├── controllers/
│   └── turnos.controller.js
├── services/
│   └── turnos.service.js
├── data/
│   └── turnos.json
├── tests/
│   └── turnos.test.js
└── docs/
    ├── guia-usuario.md
    └── evidencias-pruebas.md
```

---

## 4. Instalación y Ejecución

### Requisitos
- **Node.js** v18 o superior (probado en `v23.11.1`)
- **npm** v9 o superior (probado en `10.9.2`)

### Pasos

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar el servidor:
   ```bash
   npm start
   ```
   - **Puerto por defecto:** `3000` (configurable con la variable de entorno `PORT`)
   - **URL base:** `http://localhost:3000`
3. Ejecutar la batería de pruebas automatizadas:
   ```bash
   npm test
   ```

---

## 5. Endpoints de la API

| Método | Endpoint | Descripción | Códigos HTTP |
|---|---|---|---|
| `GET` | `/api/turnos` | Lista todas las solicitudes registradas | `200 OK` |
| `GET` | `/api/turnos/:id` | Consulta una solicitud específica por su `id` | `200 OK`, `404 Not Found` |
| `POST` | `/api/turnos` | Crea una nueva solicitud y calcula el total a pagar | `201 Created`, `400 Bad Request` |

---

## 6. Regla de Negocio Parametrizada (N = 4)

- **Obtención de `N`:** Al ordenar alfabéticamente por apellido a los integrantes del equipo según la lista oficial del **Grupo miércoles** (página 5 del PDF):
  1. Combariza Garcia Valentina (#4)
  2. Velez Cardona Johan Alexander (#19)
  3. Zapata Morales Santiago (#21)

  El primer integrante en orden alfabético ocupa el puesto **#4**, por lo tanto **`N = 4`**.

- **Porcentaje de recargo:**
  $$\text{porcentajeRecargo} = N \times 2\% = 4 \times 2\% = 8\%$$

- **Cálculo del total (implementado exclusivamente en `services/turnos.service.js`):**
  - Si `prioritario === true`:
    $$\text{totalPagar} = \text{precioBase} + \left(\text{precioBase} \times \frac{8}{100}\right)$$
  - Si `prioritario === false` o se omite:
    $$\text{totalPagar} = \text{precioBase}$$

### Ejemplos numéricos reales (`N = 4`, recargo `8%`)

| Caso | `precioBase` | `prioritario` | `porcentajeRecargo` | Cálculo | `totalPagar` |
|---|---:|---|---:|---|---:|
| Prioritario | `100000` | `true` | `8%` | `100000 + (100000 * 0.08)` | **`108000`** |
| Prioritario | `120000` | `true` | `8%` | `120000 + (120000 * 0.08)` | **`129600`** |
| No prioritario | `80000` | `false` | `0%` | `80000` | **`80000`** |
| Prioridad omitida | `90000` | *(omitido)* | `0%` | `90000` | **`90000`** |

---

## 7. Ejemplos JSON (Solicitudes y Respuestas)

### 7.1. POST exitoso (`201 Created`) — con atención prioritaria (`N = 4`, recargo `8%`)

**Petición:** `POST /api/turnos`
```json
{
  "nombreCliente": "Laura Ríos",
  "tipoServicio": "Reparación de hardware",
  "descripcion": "Cambio de pantalla urgente",
  "fechaHora": "2026-11-26T14:30",
  "precioBase": 100000,
  "prioritario": true
}
```

**Respuesta (`201 Created`):**
```json
{
  "id": 1,
  "nombreCliente": "Laura Ríos",
  "tipoServicio": "Reparación de hardware",
  "descripcion": "Cambio de pantalla urgente",
  "fechaHora": "2026-11-26T14:30",
  "precioBase": 100000,
  "prioritario": true,
  "porcentajeRecargo": 8,
  "totalPagar": 108000,
  "fechaRegistro": "2026-11-25T18:56:30.000Z"
}
```

### 7.2. POST inválido (`400 Bad Request`) — precio base igual a cero

**Petición:** `POST /api/turnos`
```json
{
  "nombreCliente": "Pedro Ruiz",
  "tipoServicio": "Mantenimiento preventivo",
  "fechaHora": "2026-11-27T15:00",
  "precioBase": 0,
  "prioritario": true
}
```

**Respuesta (`400 Bad Request`):**
```json
{
  "error": "El precio base debe ser un número mayor que cero"
}
```

### 7.3. GET exitoso (`200 OK`)

**Petición:** `GET /api/turnos/1`

**Respuesta (`200 OK`):**
```json
{
  "id": 1,
  "nombreCliente": "Laura Ríos",
  "tipoServicio": "Reparación de hardware",
  "descripcion": "Cambio de pantalla urgente",
  "fechaHora": "2026-11-26T14:30",
  "precioBase": 100000,
  "prioritario": true,
  "porcentajeRecargo": 8,
  "totalPagar": 108000,
  "fechaRegistro": "2026-11-25T18:56:30.000Z"
}
```

### 7.4. GET de registro inexistente (`404 Not Found`)

**Petición:** `GET /api/turnos/9999`

**Respuesta (`404 Not Found`):**
```json
{
  "error": "No se encontró un turno con el identificador 9999"
}
```

---

## 8. Documentación Adicional

- [Guía de usuario](docs/guia-usuario.md)
- [Evidencias de pruebas](docs/evidencias-pruebas.md)
