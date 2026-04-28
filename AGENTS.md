# AGENTS.md — BodegaTech

## 🚀 Acciones críticas antes de empezar

⚠️ **Commits:** NO hagas commits automáticamente. Prepara cambios y deja que el usuario decida.

⚠️ **DB requerida:** Antes de `./gradlew bootRun` o tests, ejecutar `docker-compose up -d` en la raíz.

⚠️ **Frontend:** `cd frontend` siempre. Comandos npm/pnpm se ejecutan **dentro de la carpeta frontend**.

## Stack
- Java 25 + Spring Boot 4.0.5 + Gradle
- PostgreSQL 16 via Docker
- SpringDoc OpenAPI **3.0.3** (versión 3.x requerida para Spring Boot 4.x — 2.x es incompatible)
- MapStruct 1.6.0 + Lombok
- Frontend: Angular 20+ (standalone) + Tailwind CSS v4 + pnpm

## Comandos esenciales

```bash
# === BACKEND ===

# Prerequisito: BD corriendo
docker-compose up -d

# Build sin tests
./gradlew clean build -x test

# Ejecutar desarrollo
./gradlew bootRun

# Tests con cobertura JaCoCo
./gradlew test jacocoTestReport
# Reporte → build/reports/jacoco/test/html/index.html

# === FRONTEND ===
cd frontend

# Desarrollo
pnpm start

# Build producción
pnpm build

# Linter + TypeScript check
pnpm lint

# Tests
pnpm test

# Generar componente standalone
pnpm ng generate component features/mi-feature/pages/mi-pagina --standalone --skip-tests
```

## URLs desarrollo

- Backend base: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/docs`
- Frontend: `http://localhost:4200`

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
- Node.js 22+ (con pnpm 10.30.3+)
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
│   │   ├── modal/         # ModalService y Modal component
│   │   ├── data-table/    # DataTable compartida
│   │   └── ...
│   ├── services/          # ⭐ ModalService, etc.
│   ├── directives/
│   ├── pipes/
│   └── utils/
├── layout/
│   ├── sidebar/
│   ├── topbar/
│   └── main-layout/       # ⭐ <bt-modal> aquí (fuera router-outlet)
├── features/              # Módulos lazy loading
│   ├── dashboard/
│   ├── inventory/
│   ├── parametrization/categories/
│   │   ├── pages/categories/
│   │   ├── state/         # CategoryStateService
│   │   └── ...
│   ├── admin/             # Users management
│   └── reports/
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
8. **Minimizar comentarios**: Solo agregar comentarios en funciones complejas que ameriten explicación. El código debe ser auto-documentado (nombres claros, lógica legible)

### Patrón Modal + DataTable (⭐ Arquitectura actual)

**Ubicación:** `<bt-modal>` debe estar en `main-layout.html` **fuera del `router-outlet`** para escapar del `overflow-hidden` y `transform` de componentes padres.

**Flow:**
1. Componente (ej: `categories`) inyecta `ModalService`
2. Define 3 `@ViewChild('templateName')` para las modales
3. En `constructor()`, crea `effect()` para reaccionar a `modalService.operationSuccess()`
4. Al confirmar, se llama al state service (HTTP async)
5. State service incrementa `operationSuccess` al completarse
6. Effect cierra la modal automáticamente
7. Segundo effect limpia formularios cuando se cierra

**Tamaños de modal (arbitrarios de Tailwind):**
- `'sm'` → `max-w-[20rem]` (320px)
- `'md'` → `max-w-[28rem]` (448px) — para formularios simples (2-3 campos)
- `'lg'` → `max-w-[32rem]` (512px) — para formularios medianos (4-5 campos)
- `'xl'` → `max-w-[36rem]` (576px)
- `'2xl'` → `max-w-[42rem]` (672px)

⚠️ **NO usar clases de Tailwind estándar como `max-w-md`, `w-sm`, etc.** — Tailwind v4 las interpreta como variables CSS `--spacing-*` del sistema de diseño (ej: `--spacing-sm = 8px`), no como tamaños de contenedor.

**Siempre usar valores arbitrarios explícitos:** `max-w-[24rem]`, `w-[22rem]`, `max-h-[30rem]`, etc.

Aplicable a: `w-*`, `h-*`, `max-w-*`, `max-h-*`, `min-w-*`, `min-h-*`.

**Botón Cancelar:** Usa `border-outline-variant bg-surface-container` con hover `hover:bg-surface-container-high hover:border-outline` para máxima visibilidad.

### State Management Pattern

Los servicios de state (ej: `CategoryStateService`) **exponen signals readonly** y mantienen estado privado writable:

```typescript
// Privado (escribible)
private _categories = signal<CategoryDto[]>([]);
private _operationSuccess = signal(0);

// Público (readonly)
readonly categories = this._categories.asReadonly();
readonly operationSuccess = this._operationSuccess.asReadonly();
```

En métodos async (con `subscribe`), incrementar `_operationSuccess` en el bloque de éxito para que los componentes detecten finalización.

### Validación de Formularios en Modales

Los formularios en modales usan validación **client-side con signals** (sin Reactive Forms).

**Pattern:**
- Signals de touch: `nameTouched = signal(false)` — activan errores post-blur/submit
- Computed errors: `nameError = computed(() => { ... })` — retornan `string | null`
- Prevent submit: callback retorna `false` si hay errores → `ModalService.confirm()` no cierra
- Prioridad: Errores del servidor (`state.fieldErrors()`) > errores cliente

**Validaciones de Categoría:**
| Campo | Reglas |
|---|---|
| name | Obligatorio, 2-100 caracteres |
| description | Máximo 500 caracteres |

**Referencia:** `frontend/src/app/features/parametrization/categories/`

### Toast Notifications

Sistema global de notificaciones tipo toast. Componente `<bt-toast>` montado en `main-layout.html` (z-50, bottom-right).

**API:**
```typescript
toastService.success(message, duration?);  // 4s default
toastService.error(message, duration?);    // 5s default
toastService.warning(message);             // 4s default
toastService.info(message);                // 4s default
```

**Integración en CRUD:**
1. Signal `pendingAction = signal<'create'|'edit'|'delete'|null>(null)` en componente
2. Setear antes de llamar state service: `this.pendingAction.set('create')`
3. En effect que reacciona a `operationSuccess`: lanzar toast con mensaje contextual
4. Effect adicional reacciona a `state.generalError()` para mostrar errores

**Ejemplo (categorías):**
```typescript
pendingAction = signal<'create' | 'edit' | 'delete' | null>(null);

effect(() => {
  if (this.state.operationSuccess() > 0 && this.pendingAction()) {
    const messages = {
      create: 'Categoría creada correctamente',
      edit: 'Categoría actualizada correctamente',
      delete: 'Categoría eliminada correctamente',
    };
    this.toastService.success(messages[this.pendingAction()!]);
  }
});

effect(() => {
  if (this.state.generalError()) {
    this.toastService.error(this.state.generalError()!);
  }
});

confirmCreateCategory(): false | void {
  this.pendingAction.set('create');
  this.state.createCategory(request);
}
```

**Referencia:** `frontend/src/app/shared/services/toast.service.ts`, `frontend/src/app/shared/components/toast/`
