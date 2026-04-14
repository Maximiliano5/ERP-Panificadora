# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Panificadora ERP** — a bakery stock management system built as a scalable foundation for a full ERP. It tracks products (mercaderías) and stock movements (ingresos/egresos), calculating current stock dynamically from transaction history rather than storing it as a mutable value.

## Running the Application

### Docker (recommended — runs all services)
```bash
docker-compose up --build
# Frontend: http://localhost:80
# Backend:  http://localhost:8080
# PostgreSQL: localhost:5432
```

### Local Development
Requirements: Java 17+, Maven 3.8+, Node.js 18+, PostgreSQL 15

```bash
# Backend
cd backend && mvn spring-boot:run   # http://localhost:8080

# Frontend
cd frontend && npm install && npm start  # http://localhost:3000
```

### Frontend scripts
```bash
npm start    # dev server
npm run build  # production build
npm test     # run tests
```

## Architecture

### Backend (`backend/src/main/java/com/erp/panificadora/`)
Standard Spring Boot layered architecture: **Controller → Service → Repository → JPA Entity**

- `model/` — JPA entities: `Mercaderia`, `MovimientoStock`, `TipoMovimiento` (enum: INGRESO/EGRESO)
- `dto/` — Request/Response DTOs (never expose entities directly)
- `controller/` — REST controllers (`MercaderiaController`, `MovimientoStockController`)
- `service/` — Business logic with `@Transactional`
- `repository/` — Spring Data JPA repositories
- `exception/` — `GlobalExceptionHandler` (@RestControllerAdvice), `ResourceNotFoundException`, `StockInsuficienteException`
- `config/` — CORS config, `DataInitializer` (seeds 8 sample products + INGRESO movements on first run)

### Frontend (`frontend/src/`)
React 18 + Material UI 5, organized as:

- `services/api.js` — Axios instance with unified error interceptor; all HTTP calls go through here
- `services/` — `mercaderiaService.js`, `movimientoService.js` wrapping the axios instance
- `pages/` — Route-level components: `Dashboard`, `MercaderiaPage`, `MovimientosPage`
- `components/` — Reusable UI components (forms, tables, cards, navbar)
- `App.jsx` — React Router routes + MUI ThemeProvider
- `theme.js` — Material UI theme customization

### Nginx (production)
`frontend/nginx.conf` proxies `/api/*` to `backend:8080` and handles SPA routing (all unknown paths → `/index.html`).

## Key Domain Rules

1. **Stock is never stored directly.** Current stock = `SUM(INGRESO quantities) - SUM(EGRESO quantities)` computed from `movimientos_stock` records.
2. **EGRESO validation:** Before registering an EGRESO, the service checks sufficient stock; returns HTTP 409 Conflict if not.
3. **DDL mode is `update`** — Hibernate manages schema changes automatically. Never drop/recreate tables in dev without checking existing data.
4. **Seed data** (`DataInitializer`) runs only when `mercaderias` table is empty. It inserts 8 products with historical INGRESO movements.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/mercaderias` | Create product |
| GET | `/api/mercaderias` | List all (supports `?nombre=` filter) |
| GET | `/api/mercaderias/{id}` | Get product |
| PUT | `/api/mercaderias/{id}` | Update product |
| DELETE | `/api/mercaderias/{id}` | Delete product |
| GET | `/api/mercaderias/valor-total` | Total stock value (supports `?nombre=` filter) |
| POST | `/api/movimientos` | Register stock movement |
| GET | `/api/movimientos` | List all movements (ordered by date DESC) |
| GET | `/api/movimientos/mercaderia/{id}` | Movements for one product |

## Extending the System

New domain modules should follow the existing pattern:
1. Add entity in `model/`, DTO pair in `dto/`
2. Create `Repository` (extends `JpaRepository`), `Service` (@Service, @Transactional), `Controller` (@RestController, @RequestMapping("/api/..."))
3. Add custom exceptions to `exception/` if needed; they're caught automatically by `GlobalExceptionHandler`
4. Add API service file in `frontend/src/services/` and connect to new pages/components
