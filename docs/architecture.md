# Arquitectura — BodegaTech

## Stack verificado

| Capa | Tecnología |
|------|-----------|
| Backend | Java 25 + Spring Boot 4.0.5 + Gradle |
| Base de datos | PostgreSQL 16 (Docker) |
| ORM | Spring Data JPA + Hibernate |
| Migraciones | Liquibase (`spring-boot-starter-liquibase`) |
| Validación | Bean Validation (`spring-boot-starter-validation`) |
| Mapeo | MapStruct 1.6.0 + Lombok |
| API Docs | SpringDoc OpenAPI 3.0.3 |
| Frontend | Angular 21.2 (standalone) |
| Estilos | Tailwind CSS v4 |
| Gestor de paquetes | pnpm 10.30.3 |

## Estructura de módulos — Backend

```
src/main/java/com/afperdomo/bodegatech/
├── common/
│   ├── audit/        ← BaseEntity (id UUID, createdAt, updatedAt)
│   ├── exception/    ← GlobalExceptionHandler, BusinessException, ResourceNotFoundException
│   └── response/     ← ApiResponse<T>, PagedResponse<T>
└── module/
    └── {modulo}/
        ├── controller/
        ├── service/       ← interfaz *Service + *ServiceImpl
        ├── repository/
        ├── entity/        ← extiende BaseEntity
        ├── dto/
        │   ├── request/   ← Create*Request, Update*Request
        │   └── response/  ← *Dto, *SummaryDto, *Detail
        └── mapper/        ← MapStruct *Mapper
```

Nuevos módulos siguen exactamente esta estructura. No colocar clases fuera de ella.

## Estructura de carpetas — Frontend

```
frontend/src/app/
├── core/
│   ├── constants/     ← enums y labels (UNIT_TYPE_OPTIONS, etc.)
│   ├── services/      ← servicios HTTP (ApiService, UnitService, etc.)
│   └── models/        ← interfaces TypeScript (requests/, responses/, api.models.ts)
├── shared/
│   ├── components/    ← componentes bt-* reutilizables (modal, data-table, toast, etc.)
│   └── services/      ← ModalService, ToastService
├── layout/
│   └── main-layout/   ← <bt-modal> y <bt-toast> van AQUÍ (fuera de router-outlet)
└── features/          ← módulos lazy loading
    └── {feature}/
        ├── components/ ← sub-componentes (form, modales, tablas)
        ├── pages/      ← página principal (smart container, 3 archivos)
        └── state/      ← *StateService (signals reactivos)
```

## Flujo de datos en features CRUD

```
Page (smart)
  ├─ Inyecta StateService + ModalService + ToastService
  ├─ @ViewChild a cada modal component (para obtener templateRef)
  ├─ openXModal() → state.loadById() + modalService.open({ template: modalComponent.templateRef })
  ├─ confirmX() → form.markAllTouched() → state.createX() / updateX()
  └─ effect(operationSuccess) → modalService.close() + toastService.success()
```

## Perfiles de entorno

| Perfil | ddl-auto | Liquibase | Activación |
|--------|----------|-----------|------------|
| `dev` | `validate` | `enabled` | Por defecto |
| `prod` | `validate` | `enabled` | Requiere env vars: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `SERVER_PORT` |

## Migraciones de base de datos (Liquibase)

Scripts SQL versionados en `src/main/resources/db/changelog/`.

### Convenciones

- **Estructura:** `db/changelog/db.changelog-master.yaml` incluye todos los SQL en orden.
- **Naming SQL:** `V{YYYYMMDD}{NNN}__{descripcion}.sql` — ejemplo: `V20260510001__create_measurement_units.sql`
- **Regla absoluta:** nunca modificar un SQL ya aplicado. Si hay un cambio, crear una nueva migración.
- **Orden de ejecución:** Liquibase aplica los cambiosets en orden lexicográfico dentro del master YAML.
- **Tests de integración:** Liquibase corre automáticamente antes de Hibernate gracias a la auto-config de Spring Boot 4.

### Agregar una nueva migración

1. Crear archivo SQL en `src/main/resources/db/changelog/` con naming `V{YYYYMMDD}{NNN}__{descripcion}.sql`
2. Agregar el `include` correspondiente en `db.changelog-master.yaml` **en orden**
3. Ejecutar `./gradlew bootRun` — Liquibase detecta y aplica automáticamente
4. En producción, Liquibase detecta la nueva migración al hacer deploy y la aplica
