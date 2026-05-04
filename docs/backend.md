# Backend — BodegaTech

> **Skills requeridas para trabajo en Backend:**
> Antes de generar código Java o Spring Boot, cargar con la herramienta `skill`:
> - `java-springboot` — para servicios, controladores, entidades, configuración
> - `postgresql-optimization` — para entidades JPA, índices, tipos de columna, queries

## Comandos esenciales

```bash
# Prerequisito siempre: base de datos corriendo
docker-compose up -d

# Build sin tests
./gradlew clean build -x test

# Desarrollo
./gradlew bootRun

# Tests con cobertura JaCoCo
./gradlew test jacocoTestReport
# Reporte → build/reports/jacoco/test/html/index.html
```

## Dependencias críticas — versiones fijas

- **SpringDoc 3.0.3** — NO bajar a 2.x: causa `NoSuchMethodError: ControllerAdviceBean.<init>` con Spring Boot 4.x
- **MapStruct requiere AMBAS entradas** en `build.gradle`:
  ```groovy
  implementation 'org.mapstruct:mapstruct:1.6.0'
  annotationProcessor 'org.mapstruct:mapstruct-processor:1.6.0'
  ```

## Quirk: GlobalExceptionHandler + SpringDoc

El handler captura `Exception.class`. Sin los checks de SpringDoc intercepta `/docs` y `/swagger-ui` devolviendo 500.

El método `handleGlobalException` **debe**:
- Tener `throws Exception` en la firma
- Recibir `HttpServletRequest` (NO `WebRequest`) para leer el URI
- Llamar los helpers privados:
  - `isSpringDocException(Throwable ex)` — verifica paquetes `org.springdoc` / `io.swagger` en la cadena de causas
  - `isSpringDocEndpoint(HttpServletRequest request)` — verifica paths `/v3/api-docs`, `/swagger-ui`, `/swagger-resources`, `/webjars`

Referencia: `common/exception/GlobalExceptionHandler.java`

## Convenciones de nombres

| Tipo | Patrón |
|------|--------|
| Servicio | `*Service` (interfaz) + `*ServiceImpl` |
| DTO entrada | `Create*Request` / `Update*Request` |
| DTO salida básica | `*Dto` |
| DTO listado | `*SummaryDto` |
| DTO detalle | `*Detail` |
| Mapper | `*Mapper` (`componentModel = "spring"`) |
| Entidad | Sin sufijo, extiende `BaseEntity` |

## Entidades JPA — Reglas del proyecto

### Índices
- `unique = true` ya crea índice B-tree en PostgreSQL — **NO agregar `@Index` adicional para el mismo campo** (redundante).
- Un UNIQUE compuesto `(col_a, col_b)` cubre búsquedas por `col_a` — índice individual en `col_a` es redundante.
- Prefijo de nombres: `idx_{tabla}_{campo}` (ej: `idx_products_is_active`).

### Tipos de columna
- Texto libre sin límite de negocio → `columnDefinition = "TEXT"` (`description`, `url`, `file_key`).
- Límite de negocio claro → `VARCHAR(n)` (`name`, `abbreviation`, `sku`).

### Auditoría
- Entidades que NO extienden `BaseEntity` y usan `@CreatedDate` necesitan `@EntityListeners(AuditingEntityListener.class)` explícito.

### Validaciones — Regla DTO vs Servicio

| Tipo | Dónde | Mecanismo | Ejemplo |
|------|-------|-----------|---------|
| Campo individual (`@NotNull`, `@Positive`, `@Min`) | **DTO** únicamente | Bean Validation | `@Positive BigDecimal salePrice` |
| Validación cruzada entre campos | **Service** | `IllegalArgumentException` | `minStock <= maxStock` |
| Unicidad de negocio | **Service** | `BusinessException` → HTTP 409 | barcode/SKU duplicado |

- **NO duplicar** en el Servicio validaciones individuales que ya existen en el DTO.
- `BusinessException` ya está manejada en `GlobalExceptionHandler` y devuelve HTTP 409.

## Patrón Mapper MapStruct

Todo `*Mapper` implementa estos 5 métodos:

```java
@Mapper(componentModel = "spring")
public interface {Resource}Mapper {
  {Resource} toEntity(Create{Resource}Request request);
  void updateEntity(Update{Resource}Request request, @MappingTarget {Resource} entity);
  {Resource}Dto toDto({Resource} entity);
  {Resource}SummaryDto toSummaryDto({Resource} entity);
  {Resource}Detail toDetail({Resource} entity);
}
```

Si hay diferencia de nombres entre entidad y DTO (ej: `isBase` → `isBaseUnit`), usar `@Mapping` explícito en cada método.

## Tests

- Tests de integración usan Testcontainers PostgreSQL — requieren Docker corriendo.
- Para correr un test individual: `./gradlew test --tests "com.afperdomo.bodegatech.module.X*"`
