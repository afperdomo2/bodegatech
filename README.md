# 🏪 BodegaTech

BodegaTech es una API REST desarrollada con **Spring Boot 4** y **Java 25**, diseñada para gestionar operaciones de bodega y almacén. Sigue una arquitectura modular por dominio, con respuestas estandarizadas y manejo de errores basado en **RFC 9457 (Problem Details)**.

---

## 📋 Tabla de contenidos

1. [Stack y versiones](#-stack-y-versiones)
2. [Requisitos previos](#-requisitos-previos)
3. [Estructura del proyecto](#-estructura-del-proyecto)
4. [Docker — servicios e infraestructura](#-docker--servicios-e-infraestructura)
5. [Entornos de ejecución](#-entornos-de-ejecución)
6. [Instalación y ejecución](#-instalación-y-ejecución)
7. [Documentación de la API (Swagger)](#-documentación-de-la-api-swagger)
8. [Estándar de errores — RFC 9457](#-estándar-de-errores--rfc-9457)
9. [Testing](#-testing)
10. [Autor](#-autor)

---

## 🧰 Stack y versiones

| Tecnología | Versión | Rol |
|---|---|---|
| Java | 25 | Lenguaje principal |
| Spring Boot | 4.0.5 | Framework principal |
| Spring Data JPA | (BOM Boot) | Persistencia / ORM — incluye optimistic locking (`@Version`) |
| Spring Validation | (BOM Boot) | Validación de entrada |
| PostgreSQL | 16 | Base de datos relacional |
| SpringDoc OpenAPI | 3.0.3 | Documentación Swagger |
| Lombok | (BOM Boot) | Reducción de boilerplate |
| MapStruct | 1.6.0 | Mapeo entidad ↔ DTO |
| JUnit 5 + Mockito | (BOM Boot) | Tests unitarios |
| Testcontainers | 1.20.0 | Tests de integración con BD real |
| Gradle | 9.x | Sistema de build |
| Docker / Compose | cualquier versión reciente | Infraestructura local |

> **Nota:** SpringDoc 3.x es requerido para Spring Boot 4.x. La versión 2.x causa `NoSuchMethodError: ControllerAdviceBean.<init>` y no es compatible.

---

## ✅ Requisitos previos

- **Java 25** o superior instalado y configurado en `JAVA_HOME`
- **Docker** y **Docker Compose** (para levantar PostgreSQL)
- **Git**

El wrapper de Gradle (`./gradlew`) está incluido en el repositorio; no es necesario instalar Gradle por separado.

---

## 🗂 Estructura del proyecto

```
bodegatech/
├── src/
│   ├── main/
│   │   ├── java/com/afperdomo/bodegatech/
│   │   │   ├── BodegatechApplication.java
│   │   │   ├── config/
│   │   │   │   ├── JpaConfig.java
│   │   │   │   └── OpenApiConfig.java
│   │   │   ├── common/                              # Código transversal
│   │   │   │   ├── audit/
│   │   │   │   │   └── BaseEntity.java              # UUID + createdAt + updatedAt + version (@Version)
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java  # RFC 9457 — ProblemDetail
│   │   │   │   │   ├── BusinessException.java       # 409 Conflict
│   │   │   │   │   ├── ResourceNotFoundException.java # 404 Not Found
│   │   │   │   │   └── SkuGenerationException.java   # 500 Internal Server Error — generación de SKU
│   │   │   │   ├── response/
│   │   │   │   │   ├── ApiResponse.java             # Wrapper de respuestas exitosas
│   │   │   │   │   └── PagedResponse.java           # Wrapper de respuestas paginadas
│   │   │   │   └── util/
│   │   │   │       └── SkuGenerator.java            # Componente para generar SKUs únicos
│   │   │   └── module/
│   │   │       └── product/                         # Módulo: Productos
│   │   │           ├── controller/ProductController.java
│   │   │           ├── service/ProductService.java
│   │   │           ├── repository/
│   │   │           │   ├── ProductRepository.java
│   │   │           │   └── SkuValidationRepository.java # Interfaz para validación de SKU
│   │   │           ├── entity/Product.java
│   │   │           ├── dto/
│   │   │           │   ├── CreateProductRequest.java
│   │   │           │   ├── UpdateProductRequest.java
│   │   │           │   └── ProductDto.java
│   │   │           └── mapper/ProductMapper.java
│   │   └── resources/
│   │       ├── application.yml          # Configuración base
│   │       ├── application-dev.yml      # Perfil desarrollo
│   │       └── application-prod.yml     # Perfil producción
│   └── test/
│       └── java/com/afperdomo/bodegatech/
│           └── module/product/
│               ├── ProductControllerTest.java
│               └── ProductServiceTest.java
├── docker-compose.yml
├── build.gradle
├── settings.gradle
└── README.md
```

Cada módulo de negocio sigue la misma estructura interna: `controller / service / repository / entity / dto / mapper`.

---

## 🐳 Docker — servicios e infraestructura

El archivo `docker-compose.yml` define el entorno local de desarrollo:

| Servicio | Imagen | Puerto | Red |
|---|---|---|---|
| `postgres` | `postgres:16-alpine` | `5432:5432` | `bodegatech_network` |

**Credenciales por defecto (solo desarrollo):**

| Parámetro | Valor |
|---|---|
| Base de datos | `bodegatech_db` |
| Usuario | `bodegatech_user` |
| Contraseña | `bodegatech_password` |
| Host | `localhost:5432` |

Los datos se persisten en el volumen `postgres_data`. El servicio incluye un healthcheck que verifica disponibilidad cada 30 segundos.

```bash
# Iniciar
docker-compose up -d

# Detener
docker-compose down

# Detener y eliminar volúmenes (borra datos)
docker-compose down -v
```

---

## ⚙️ Entornos de ejecución

El proyecto usa Spring Profiles para gestionar la configuración por ambiente.

### Perfil `dev` (activo por defecto)

- `ddl-auto: update` — el esquema se actualiza automáticamente
- SQL visible en consola
- Logs detallados (DEBUG para la aplicación, Hibernate SQL activo)
- Conexión directa a la BD local

### Perfil `prod`

- `ddl-auto: validate` — solo valida el esquema; nunca lo modifica
- Sin SQL en consola
- Logs reducidos (WARN para root, INFO para la aplicación)
- Configuración obligatoria mediante variables de entorno:

| Variable de entorno | Descripción | Ejemplo |
|---|---|---|
| `DB_URL` | URL JDBC de la base de datos | `jdbc:postgresql://db-host:5432/bodegatech_db` |
| `DB_USER` | Usuario de la base de datos | `bodegatech_user` |
| `DB_PASSWORD` | Contraseña de la base de datos | `s3cr3t` |
| `SERVER_PORT` | Puerto del servidor HTTP | `8080` |

**Activar un perfil:**

```bash
# Via argumento
./gradlew bootRun --args='--spring.profiles.active=prod'

# Via variable de entorno
export SPRING_PROFILES_ACTIVE=prod
./gradlew bootRun

# Via JAR
java -jar build/libs/bodegatech-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

---

## 🚀 Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd bodegatech

# 2. Levantar la base de datos
docker-compose up -d

# 3. Compilar (sin tests)
./gradlew clean build -x test

# 4. Ejecutar en modo desarrollo
./gradlew bootRun
```

La API estará disponible en: `http://localhost:8080/api/v1`

**Context path base:** `/api/v1`

---

## 📖 Documentación de la API (Swagger)

Una vez que la aplicación esté corriendo:

| Recurso | URL |
|---|---|
| Swagger UI | `http://localhost:8080/api/v1/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8080/api/v1/docs` |

La documentación está en español e incluye ejemplos de request/response para todos los endpoints.

### Endpoints disponibles — Productos

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/products` | Listar productos — **paginado** |
| `GET` | `/api/v1/products/{id}` | Obtener producto por ID |
| `POST` | `/api/v1/products` | Crear nuevo producto |
| `PATCH` | `/api/v1/products/{id}` | Actualizar producto parcialmente |
| `DELETE` | `/api/v1/products/{id}` | Desactivar producto (soft delete) |

### Formato de respuesta exitosa

Todas las respuestas exitosas incluyen el wrapper `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": { ... }
}
```

### Campo `version` — optimistic locking

Todas las respuestas de producto incluyen el campo `version`. Este número se incrementa automáticamente en cada modificación (gestionado por Hibernate). Su propósito es detectar conflictos de concurrencia: si dos procesos intentan modificar el mismo producto simultáneamente, el segundo recibirá un **409 Conflict**.

```json
{
  "id": "123e4567-...",
  "name": "Laptop Dell",
  "version": 3,
  ...
}
```

### PATCH — actualización parcial

El endpoint `PATCH /products/{id}` acepta cualquier combinación de campos; los campos ausentes conservan su valor actual:

```json
// Solo actualiza el precio y el stock — el resto no cambia
{
  "price": 1299.99,
  "stock": 20
}
```

### Generación automática de SKU

Los SKU (Stock Keeping Unit) se generan automáticamente en el backend y **no deben ser enviados por el cliente**. El campo `sku` en `CreateProductRequest` no existe — será ignorado si se envía.

#### Formato y estrategia

- **Patrón:** `{nombre_3chars}-{categoria_3chars}-{timestamp_hex_4chars}`
- **Ejemplo:** `LAP-ELE-4F2A` (de "Laptop" + "Electrónica")
- **Normalización:**
  - Se eliminan acentos y caracteres especiales
  - Se convierten a mayúsculas
  - Se extraen solo los primeros 3 caracteres del nombre y la categoría
  - El timestamp en hexadecimal proporciona variabilidad para reintentos

#### Comportamiento por operación

**En `POST` (creación):**
- Se genera un SKU único automáticamente
- Si la `category` es `null`, se usa `"GEN"` como valor por defecto
- Si ocurre una colisión (SKU duplicado), se reintenta hasta 3 veces con diferentes timestamps

**En `PATCH` (actualización):**
- El SKU se **regenera SOLO** si cambian `name` o `category`
- Si cambias solo `price` o `stock`, el SKU existente se conserva
- Ejemplo:
  ```json
  // ❌ Esto no regenerará el SKU
  {
    "price": 1999.99,
    "stock": 50
  }
  
  // ✅ Esto sí regenerará el SKU (nombre cambió)
  {
    "name": "Laptop Premium",
    "price": 1999.99
  }
  ```

#### Campos en request y response

- **`CreateProductRequest`:** El campo `sku` **no existe** — se genera automáticamente
- **`ProductDto` (response):** Incluye el campo `sku` con modo lectura (`READ_ONLY` en Swagger)

```json
// Response — el sku se devuelve pero no se puede cambiar directamente
{
  "id": "123e4567-...",
  "name": "Laptop Dell",
  "sku": "LAP-ELE-4F2A",
  "category": "Electrónica",
  "price": 1500.00,
  "stock": 10,
  ...
}
```

#### Manejo de errores

Si después de 3 reintentos no se logra generar un SKU único (colisión extrema), la API retorna:
- **Código HTTP:** `500 Internal Server Error`
- **Excepción:** `SkuGenerationException`

Este escenario es muy improbable en producción debido a la combinación de nombre + categoría + timestamp.

### Formato de respuesta paginada

```json
{
  "success": true,
  "message": "...",
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 10,
    "totalElements": 42,
    "totalPages": 5,
    "last": false
  }
}
```

---

## 🚨 Estándar de errores — RFC 9457

Todos los errores de la API siguen el estándar **RFC 9457 — Problem Details for HTTP APIs**. Las respuestas de error usan `Content-Type: application/problem+json`.

### Estructura de un error

```json
{
  "type": "about:blank",
  "title": "No encontrado",
  "status": 404,
  "detail": "Producto con ID 'abc-123' no fue encontrado",
  "instance": "/api/v1/products/abc-123"
}
```

Para errores de validación (400), el campo `errors` detalla cada campo inválido:

```json
{
  "type": "about:blank",
  "title": "Error de validación",
  "status": 400,
  "detail": "La solicitud contiene campos inválidos",
  "instance": "/api/v1/products",
  "errors": {
    "nombre": "no debe estar vacío",
    "precio": "debe ser mayor que 0"
  }
}
```

### Códigos HTTP utilizados

| Código | Situación |
|---|---|
| `200 OK` | Consulta exitosa |
| `201 Created` | Recurso creado |
| `204 No Content` | Eliminación exitosa |
| `400 Bad Request` | Validación fallida o JSON mal formado |
| `404 Not Found` | Recurso no encontrado |
| `409 Conflict` | Error de negocio (`BusinessException`) o conflicto de concurrencia (optimistic locking) |
| `500 Internal Server Error` | Error inesperado del servidor |

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
./gradlew test

# Tests con reporte de cobertura (JaCoCo)
./gradlew test jacocoTestReport
```

El reporte de cobertura se genera en: `build/reports/jacoco/test/html/index.html`

### Suites de prueba

| Archivo | Tipo | Descripción |
|---|---|---|
| `ProductServiceTest` | Unitario | Lógica de negocio con Mockito |
| `ProductControllerTest` | Integración | Endpoints REST con Testcontainers + PostgreSQL real |

Los tests de integración usan **Testcontainers** para levantar una instancia real de PostgreSQL en Docker, sin depender de la base de datos local.

---

## 👤 Autor

**Andrés Felipe Perdomo**
- GitHub: [@afperdomo2](https://github.com/afperdomo2)
