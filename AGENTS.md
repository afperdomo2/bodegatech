# AGENTS.md — BodegaTech

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

- Context path base: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/api/v1/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api/v1/docs`

## GlobalExceptionHandler — quirk de SpringDoc

El handler en `shared/exception/GlobalExceptionHandler.java` captura `Exception.class`.  
Sin los checks de SpringDoc, intercepta peticiones a `/docs` y `/swagger-ui` devolviendo 500.

El método `handleGlobalException` **debe** tener `throws Exception` y los helpers privados:
- `isSpringDocException(Throwable ex)` — verifica paquetes `org.springdoc` / `io.swagger` en la cadena de causas
- `isSpringDocEndpoint(HttpServletRequest request)` — verifica paths `/v3/api-docs`, `/swagger-ui`, `/swagger-resources`, `/webjars`

El parámetro debe ser `HttpServletRequest` (no `WebRequest`) para poder leer el URI.

## Estructura de módulos

```
shared/
  audit/        ← BaseEntity (id UUID, createdAt, updatedAt)
  exception/    ← GlobalExceptionHandler, BusinessException, ResourceNotFoundException
  response/     ← ApiResponse<T>, PagedResponse<T>
module/
  {modulo}/
    controller/ service/ repository/ entity/ dto/ mapper/
```

Nuevos módulos siguen exactamente esta estructura. No colocar clases fuera de ella.

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
