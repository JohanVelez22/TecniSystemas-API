# Guía de Usuario — TecniSystemas API

Esta guía explica cómo poner en marcha y consumir la API REST de **TecniSystemas** desde cualquier cliente HTTP (curl, PowerShell, Postman, Insomnia o Thunder Client).

---

## 1. Requisitos previos

- Tener instalado **Node.js** (versión 18 o superior) y **npm**.
- Verificar versiones en la terminal:
  ```bash
  node -v
  npm -v
  ```

## 2. Instalación y arranque

Desde la carpeta raíz del proyecto:

```bash
npm install
npm start
```

Verás en consola:
```text
Servidor TecniSystemas API escuchando en http://localhost:3000
```

## 3. Uso de los endpoints

### 3.1. Listar todos los turnos (`GET /api/turnos`)

**curl:**
```bash
curl -i http://localhost:3000/api/turnos
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/turnos -Method Get
```

### 3.2. Crear un nuevo turno (`POST /api/turnos`)

**curl (con atención prioritaria):**
```bash
curl -i -X POST http://localhost:3000/api/turnos \
  -H "Content-Type: application/json" \
  -d "{\"nombreCliente\":\"Laura Ríos\",\"tipoServicio\":\"Reparación de hardware\",\"descripcion\":\"Cambio de pantalla\",\"fechaHora\":\"2026-11-26T14:30\",\"precioBase\":100000,\"prioritario\":true}"
```

**PowerShell:**
```powershell
$body = @{
  nombreCliente = "Laura Ríos"
  tipoServicio  = "Reparación de hardware"
  descripcion   = "Cambio de pantalla"
  fechaHora     = "2026-11-26T14:30"
  precioBase    = 100000
  prioritario   = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/turnos -Method Post -ContentType "application/json" -Body $body
```

### 3.3. Consultar un turno por ID (`GET /api/turnos/:id`)

**curl:**
```bash
curl -i http://localhost:3000/api/turnos/1
```

Si el identificador no existe (por ejemplo `/api/turnos/999`), el servidor responderá `404 Not Found` con un mensaje JSON descriptivo.

## 4. Persistencia de datos

Todos los turnos registrados se guardan automáticamente en `data/turnos.json`. Al reiniciar el servidor, los registros existentes se conservan sin necesidad de configurar una base de datos externa.

## 5. Ejecución de pruebas automatizadas

```bash
npm test
```

Las pruebas utilizan un archivo temporal aislado (`data/turnos.test.json`) que se elimina automáticamente al finalizar, por lo que no alteran los datos almacenados en `data/turnos.json`.

