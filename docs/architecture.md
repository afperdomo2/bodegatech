# Arquitectura — BodegaTech

## Stack verificado

| Capa | Tecnología |
|------|-----------|
| Backend | Java 25 + Spring Boot 4.0.5 + Gradle |
| Base de datos | PostgreSQL 16 (Docker) |
| ORM | Spring Data JPA + Hibernate |
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

| Perfil | ddl-auto | Activación |
|--------|----------|-----------|
| `dev` | `update` | Por defecto |
| `prod` | `validate` | Requiere env vars: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `SERVER_PORT` |
