# Panificadora ERP — Control de Stock

Sistema de gestión de stock para panificadora, diseñado como base escalable de un ERP completo.

## Stack

| Capa       | Tecnología                          |
|------------|-------------------------------------|
| Backend    | Java 17 + Spring Boot 3.2           |
| Base de datos | PostgreSQL 15                    |
| ORM        | JPA / Hibernate                     |
| Frontend   | React 18 + Material UI 5            |
| Contenedores | Docker + Docker Compose           |

---

## Estructura del proyecto

```
SistemaERP/
├── backend/                  # Spring Boot
│   └── src/main/java/com/erp/panificadora/
│       ├── config/           # CORS, DataInitializer
│       ├── controller/       # MercaderiaController, MovimientoStockController
│       ├── service/          # MercaderiaService, MovimientoStockService
│       ├── repository/       # JPA Repositories
│       ├── model/            # Mercaderia, MovimientoStock, TipoMovimiento
│       ├── dto/              # Request/Response DTOs
│       └── exception/        # GlobalExceptionHandler, excepciones custom
├── frontend/                 # React + MUI
│   └── src/
│       ├── components/       # Navbar, tablas, formularios
│       ├── pages/            # Dashboard, MercaderiaPage, MovimientosPage
│       └── services/         # Clientes axios
└── docker-compose.yml
```

---

## Cómo levantar el proyecto

### Opción 1 — Docker (recomendado, todo en un comando)

```bash
docker-compose up --build
```

- Frontend: http://localhost:80
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

---

### Opción 2 — Ejecución local (desarrollo)

#### Requisitos previos
- Java 17+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 15 corriendo en localhost:5432

#### 1. Crear la base de datos

```sql
CREATE DATABASE panificadora_db;
```

#### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

El backend arranca en `http://localhost:8080`.
Al iniciar por primera vez carga datos de ejemplo automáticamente.

#### 3. Frontend

```bash
cd frontend
npm install
npm start
```

El frontend arranca en `http://localhost:3000`.

---

## API Endpoints

### Mercaderías

| Método | Endpoint                          | Descripción                         |
|--------|-----------------------------------|-------------------------------------|
| POST   | `/api/mercaderias`                | Crear mercadería                    |
| GET    | `/api/mercaderias`                | Listar todas                        |
| GET    | `/api/mercaderias?nombre=harina`  | Buscar por nombre (parcial)         |
| GET    | `/api/mercaderias/{id}`           | Obtener por ID                      |
| PUT    | `/api/mercaderias/{id}`           | Actualizar                          |
| DELETE | `/api/mercaderias/{id}`           | Eliminar                            |
| GET    | `/api/mercaderias/valor-total`    | Valor total del stock               |
| GET    | `/api/mercaderias/valor-total?nombre=harina` | Valor filtrado       |

### Movimientos de stock

| Método | Endpoint                                   | Descripción                    |
|--------|--------------------------------------------|--------------------------------|
| POST   | `/api/movimientos`                         | Registrar movimiento           |
| GET    | `/api/movimientos`                         | Listar todos (más reciente primero) |
| GET    | `/api/movimientos/mercaderia/{id}`         | Movimientos de una mercadería  |

---

## Lógica de stock

El stock **nunca se modifica directamente**. Se calcula como:

```
stock_actual = SUM(ingresos) - SUM(egresos)
```

Al registrar un **EGRESO**, el sistema valida que haya stock suficiente. Si no, devuelve HTTP 409 con el detalle del error.

---

## Campos por tipo de movimiento

**INGRESO:**
- `proveedor` — de quién se recibe la mercadería
- `receptor` — quién la recibe en la panificadora

**EGRESO:**
- `motivo` — razón del egreso (producción, merma, etc.)

Ambos tipos comparten: `mercaderiaId`, `cantidad`, `observaciones`, `fecha` (automática).

---

## Ejemplos de uso con curl

```bash
# Crear mercadería
curl -X POST http://localhost:8080/api/mercaderias \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Harina 000","precioUnitario":850}'

# Registrar ingreso
curl -X POST http://localhost:8080/api/movimientos \
  -H "Content-Type: application/json" \
  -d '{
    "tipo":"INGRESO",
    "mercaderiaId":1,
    "cantidad":100,
    "proveedor":"Molinos SA",
    "receptor":"Juan",
    "observaciones":"Compra semanal"
  }'

# Registrar egreso
curl -X POST http://localhost:8080/api/movimientos \
  -H "Content-Type: application/json" \
  -d '{
    "tipo":"EGRESO",
    "mercaderiaId":1,
    "cantidad":20,
    "motivo":"Producción de pan",
    "observaciones":"Turno mañana"
  }'

# Valor total del stock filtrado
curl http://localhost:8080/api/mercaderias/valor-total?nombre=harina
```
