# AGENTS.md — BodegaTech

## Instrucciones para agentes

⚠️ **IMPORTANTE:** Después de completar cualquier requerimiento:
- **NO hagas commits automáticamente**
- Prepara los cambios (stage, verificación) pero deja que el usuario haga el commit
- Solo haz commits si el usuario lo solicita explícitamente

## Stack
- Java 25 + Spring Boot 4.0.5 + Gradle
- PostgreSQL 16 via Docker
- SpringDoc OpenAPI **3.0.3** (versión 3.x requerida para Spring Boot 4.x — 2.x es incompatible)
- MapStruct 1.6.0 + Lombok

## Comandos esenciales

```bash
# Prerequisito: BD corriendo
docker-compose up -d

# Build sin tests
./gradlew clean build -x test

# Ejecutar
./gradlew bootRun

# Tests
./gradlew test

# Reporte de cobertura → build/reports/jacoco/test/html/index.html
./gradlew test jacocoTestReport
```

## URLs en desarrollo

- Context path base: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/docs`

## GlobalExceptionHandler — quirk de SpringDoc

El handler en `common/exception/GlobalExceptionHandler.java` captura `Exception.class`.  
Sin los checks de SpringDoc, intercepta peticiones a `/docs` y `/swagger-ui` devolviendo 500.

El método `handleGlobalException` **debe** tener `throws Exception` y los helpers privados:
- `isSpringDocException(Throwable ex)` — verifica paquetes `org.springdoc` / `io.swagger` en la cadena de causas
- `isSpringDocEndpoint(HttpServletRequest request)` — verifica paths `/v3/api-docs`, `/swagger-ui`, `/swagger-resources`, `/webjars`

El parámetro debe ser `HttpServletRequest` (no `WebRequest`) para poder leer el URI.

## Estructura de módulos

```
common/
  audit/        ← BaseEntity (id UUID, createdAt, updatedAt)
  exception/    ← GlobalExceptionHandler, BusinessException, ResourceNotFoundException
  response/     ← ApiResponse<T>, PagedResponse<T>
module/
  {modulo}/
    controller/ service/ repository/ entity/ dto/ mapper/
```

Nuevos módulos siguen exactamente esta estructura. No colocar clases fuera de ella.

## Entidades JPA — Buenas prácticas

Cuando se cree o modifique una entidad, cargar el skill `postgresql-optimization`
para validar buenas prácticas SQL antes de finalizar.

**Reglas establecidas en el proyecto:**

### Índices
- Columnas con `unique = true` NO necesitan `@Index` adicional — PostgreSQL ya
  crea un índice B-tree implícito con el UNIQUE constraint. Agregar ambos es redundancia.
- Un UNIQUE compuesto `(col_a, col_b)` cubre búsquedas por `col_a` solo — el
  índice individual en `col_a` es redundante.
- Nombres de índices con prefijo de tabla: `idx_{tabla}_{campo}`.
  Ejemplos: `idx_products_is_active`, `idx_units_type`, `idx_categories_is_active`.

### Tipos de columnas
- Campos de texto libre sin límite de negocio real → `columnDefinition = "TEXT"`.
  Ejemplos: `description`, `url`, `file_key`.
- Campos con límite de negocio claro → `VARCHAR(n)`.
  Ejemplos: `name`, `abbreviation`, `sku`.

### Auditoría
- Entidades que NO extienden `BaseEntity` y usan `@CreatedDate` necesitan
  `@EntityListeners(AuditingEntityListener.class)` explícito. De lo contrario,
  el campo no se populará automáticamente.

## Convenciones de nombres

| Tipo | Patrón |
|------|--------|
| Servicio | `*Service` (interfaz) + `*ServiceImpl` |
| DTO entrada | `*Request` |
| DTO salida | `*Response` |
| Mapper | `*Mapper` (MapStruct, `componentModel = "spring"`) |
| Entidad | Sin sufijo, extiende `BaseEntity` |

## Respuestas de la API

Todas las respuestas usan `ApiResponse<T>`:
```json
{ "success": true/false, "message": "...", "data": ... }
```

Paginación usa `PagedResponse<T>` dentro del campo `data`.

Códigos HTTP: 200 OK, 201 Created, 204 No Content (DELETE), 400, 404, 422 (error de negocio), 500.

## Perfiles

- `dev` (activo por defecto): `ddl-auto: update`, logs detallados
- `prod`: requiere env vars `DB_URL`, `DB_USER`, `DB_PASSWORD`, `SERVER_PORT`; `ddl-auto: validate`

## Dependencias — versiones críticas

- **No bajar SpringDoc a 2.x** — causa `NoSuchMethodError: ControllerAdviceBean.<init>` con Spring Boot 4.x
- MapStruct requiere su annotation processor además del implementation:
  ```groovy
  annotationProcessor 'org.mapstruct:mapstruct-processor:1.6.0'
  ```

---

## Frontend — Angular v20+ (BodegaTech UI)

### Stack
- Angular 20+ (standalone components)
- Tailwind CSS v4
- TypeScript con `signal()` para estado reactivo
- SCSS para estilos de componentes
- Prefix de componentes: `bt-`

### Estructura de carpetas
```
frontend/src/app/
├── core/
│   ├── services/          # ApiService, etc.
│   └── models/            # Interfaces globales
├── shared/
│   ├── components/        # Componentes reutilizables (bt-*)
│   ├── directives/
│   ├── pipes/
│   └── utils/
├── layout/
│   ├── sidebar/
│   ├── topbar/
│   └── main-layout/
├── features/              # Módulos lazy loading
│   ├── dashboard/
│   └── inventory/
├── app.routes.ts
├── app.config.ts
└── app.ts
```

### Convenciones de nombres
| Tipo | Patrón |
|------|--------|
| Componente | `*Component` (PascalCase en export) |
| Selector | `bt-*` (kebab-case) |
| Servicio | `*Service` |
| Interface | `*` (PascalCase) |
| Archivo | `*.ts`, `*.html`, `*.scss` (kebab-case) |

### Comandos esenciales
```bash
cd frontend

# Desarrollo
pnpm start

# Build producción
pnpm build

# Tests
pnpm test

# Lint
pnpm lint

# Generar componente
pnpm ng generate component features/mi-feature/pages/mi-pagina --standalone --skip-tests

# Generar servicio
pnpm ng generate service core/services/mi-servicio
```

### URLs en desarrollo
- Aplicación: `http://localhost:4200`
- API Backend: `http://localhost:8080/api` (configurable en `src/environments/environment.ts`)

### Pautas de desarrollo
1. **Standalone components**: Todos los componentes nuevos deben ser standalone (`--standalone`)
2. **Signals**: Usar `signal()` para estado, `computed()` para derivados
3. **Lazy loading**: Los features se cargan bajo demanda en `app.routes.ts`
4. **Prefijo bt-**: Todos los selectores de componentes deben usar este prefijo
5. **SCSS modular**: Estilos específicos en cada componente, variables globales en `src/styles/`
6. **Tailwind first**: Preferir clases de Tailwind sobre estilos personalizados
7. **No cambiar nombres de componentes**: Usar el patrón generado por Angular CLI (ej: `DashboardComponent` → `src/app/.../dashboard.ts`)
