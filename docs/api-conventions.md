# Convenciones de API — BodegaTech

## Envelope de respuesta

Todas las respuestas usan `ApiResponse<T>`:
```json
{ "success": true, "message": "...", "data": { ... } }
```

Errores:
```json
{ "success": false, "message": "Descripción del error", "data": null }
```

## Códigos HTTP

| Situación | Código |
|-----------|--------|
| Lectura / actualización OK | 200 |
| Creación OK | 201 |
| Eliminación OK | 204 No Content |
| Error de validación (campos) | 400 |
| Recurso no encontrado | 404 |
| Error de negocio (regla violada) | 422 |
| Error interno | 500 |

## Paginación

Las listas paginadas retornan `ApiResponse<PagedResponse<T>>`:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "currentPage": 0,
    "pageSize": 10,
    "totalElements": 42,
    "totalPages": 5
  }
}
```

Query params estándar: `?page=0&size=10`

## Mapeo de endpoints REST por recurso

```
POST   /api/{recursos}        → ApiResponse<{Resource}Dto>          (201)
GET    /api/{recursos}        → ApiResponse<PagedResponse<{Resource}SummaryDto>>  (200)
GET    /api/{recursos}/{id}   → ApiResponse<{Resource}Detail>        (200)
PATCH  /api/{recursos}/{id}   → ApiResponse<{Resource}Dto>          (200)
DELETE /api/{recursos}/{id}   → ApiResponse<Void>                    (204)
```

## Tipos de DTOs

| DTO | Campos | Cuándo se usa |
|-----|--------|---------------|
| `{Resource}Dto` | id + campos clave + createdAt | Respuesta de POST y PATCH |
| `{Resource}SummaryDto` | igual que Dto (alias) | Listado paginado GET / |
| `{Resource}Detail` | todo + `version` + `updatedAt` + relaciones | GET /{id} |
| `Create{Resource}Request` | campos editables | Body del POST |
| `Update{Resource}Request` | campos editables | Body del PATCH |

`{Resource}Detail` extiende `{Resource}SummaryDto` y agrega `version`, `updatedAt`, y relaciones completas (objetos anidados, no solo IDs).

## Errores de validación (400)

El backend retorna errores por campo en el body:
```json
{
  "success": false,
  "message": "Error de validación",
  "fieldErrors": {
    "name": "El nombre es requerido",
    "abbreviation": "La abreviación no puede exceder 20 caracteres"
  }
}
```

En el frontend, el state service los almacena en `_fieldErrors = signal<Record<string, string>>({})` y los pasa como `input()` a los formularios.

## URLs de desarrollo

- Backend: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/docs`
- Frontend: `http://localhost:4200`

## Modelos TypeScript — ubicación

```
frontend/src/app/core/models/
├── requests/
│   └── {entity}.requests.ts    ← Create*Request, Update*Request
├── responses/
│   └── {entity}.responses.ts   ← *Dto, *SummaryDto, *Detail
└── api.models.ts               ← ApiResponse<T>, PagedResponse<T>
```
