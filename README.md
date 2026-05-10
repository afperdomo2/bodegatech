# 🏪 BodegaTech

BodegaTech es una API REST desarrollada con **Spring Boot 4** y **Java 25**, diseñada para gestionar operaciones de bodega y almacén. Sigue una arquitectura modular por dominio, con respuestas estandarizadas y manejo de errores basado en **RFC 9457 (Problem Details)**.

---

## 📋 Tabla de contenidos

1. [Stack y versiones](#stack-y-versiones)
2. [Requisitos previos](#requisitos-previos)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Docker — servicios e infraestructura](#docker--servicios-e-infraestructura)
5. [Almacenamiento de imágenes — AWS S3](#almacenamiento-de-imágenes--aws-s3)
6. [Entornos de ejecución](#entornos-de-ejecución)
7. [Instalación y ejecución](#instalación-y-ejecución)
8. [Documentación de la API (Swagger)](#documentación-de-la-api-swagger)
9. [Estándar de errores — RFC 9457](#estándar-de-errores--rfc-9457)
10. [Frontend — BodegaTech UI](#frontend--bodegatech-ui)
11. [Terraform — Infraestructura AWS](#terraform--infraestructura-aws)
12. [Testing](#testing)
13. [Autor](#autor)

---

## 🧰 Stack y versiones

| Tecnología | Versión | Rol |
|---|---|---|
| Java | 25 | Lenguaje principal |
| Spring Boot | 4.0.5 | Framework principal |
| Spring Data JPA | (BOM Boot) | Persistencia / ORM — optimistic locking (`@Version`) |
| Spring Validation | (BOM Boot) | Validación de entrada |
| PostgreSQL | 16 | Base de datos relacional |
| SpringDoc OpenAPI | 3.0.3 | Documentación Swagger |
| Lombok | (BOM Boot) | Reducción de boilerplate |
| MapStruct | 1.6.0 | Mapeo entidad DTO |
| JUnit 5 + Mockito | (BOM Boot) | Tests unitarios |
| Testcontainers | 1.20.0 | Tests de integración con BD real |
| Gradle | 9.x | Sistema de build |
| Angular | 21.2 | Frontend SPA |
| Tailwind CSS | v4 | Estilos del frontend |
| pnpm | 10.30.3 | Gestor de paquetes frontend |

> **Nota:** SpringDoc 3.x es requerido para Spring Boot 4.x. La versión 2.x causa `NoSuchMethodError` y no es compatible.

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
├── src/main/java/com/afperdomo/bodegatech/
│   ├── BodegatechApplication.java
│   ├── config/
│   │   ├── JpaConfig.java
│   │   └── OpenApiConfig.java
│   ├── common/
│   │   ├── audit/BaseEntity.java          # UUID + createdAt + updatedAt + version
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java    # RFC 9457
│   │   │   ├── BusinessException.java         # 409 Conflict
│   │   │   ├── ResourceNotFoundException.java # 404 Not Found
│   │   │   ├── SkuGenerationException.java    # 500 SKU
│   │   │   └── CategoryInUseException.java    # 409 Categoría en uso
│   │   ├── response/
│   │   │   ├── ApiResponse.java          # Wrapper respuestas exitosas
│   │   │   └── PagedResponse.java        # Wrapper respuestas paginadas
│   │   └── util/SkuGenerator.java
│   └── module/
│       ├── product/
│       │   ├── controller/
│       │   │   ├── ProductController.java
│       │   │   ├── ProductImageController.java
│       │   │   └── LambdaCallbackController.java
│       │   ├── service/
│       │   ├── repository/
│       │   ├── entity/{Product, ProductImage}.java
│       │   ├── dto/{request, response}/...
│       │   └── mapper/
│       ├── category/
│       ├── unit/
│       ├── supplier/
│       └── warehouse/
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   └── application-prod.yml
├── src/test/java/com/afperdomo/bodegatech/
├── frontend/
│   ├── src/app/
│   │   ├── core/                   # Servicios, modelos, interceptores
│   │   ├── shared/                 # Componentes reutilizables (bt-*)
│   │   ├── layout/                 # main-layout, sidebar, topbar
│   │   └── features/               # Módulos lazy
│   │       ├── auth/
│   │       ├── dashboard/
│   │       ├── inventory/
│   │       ├── parametrization/
│   │       ├── reports/
│   │       └── admin/
│   ├── package.json
│   └── pnpm-lock.yaml
├── terraform/
├── docker-compose.yml
├── build.gradle
└── README.md
```

Cada módulo de negocio sigue la misma estructura: `controller / service / repository / entity / dto / mapper`.

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

## ☁️ Almacenamiento de imágenes — AWS S3

BodegaTech utiliza **Amazon S3** para almacenar imágenes de productos. Las imágenes se suben mediante **presigned URLs** generadas por el backend, proporcionando un mecanismo seguro sin exponer credenciales AWS al cliente.

### Configuración — Variables de entorno

La configuración de AWS S3 se centraliza en `application.yml` bajo la sección `app.aws.*`:

| Variable de entorno | Clave YAML | Default | Descripción |
|---|---|---|---|
| `AWS_REGION` | `app.aws.region` | `us-east-1` | Región de AWS |
| `AWS_ACCESS_KEY_ID` | `app.aws.access-key-id` | (vacío) | ID de clave de acceso IAM |
| `AWS_SECRET_ACCESS_KEY` | `app.aws.secret-access-key` | (vacío) | Clave secreta IAM |
| `AWS_S3_BUCKET_NAME` | `app.aws.s3.bucket-name` | `bodegatech-uploads` | Nombre del bucket S3 |
| `AWS_S3_PUBLIC_URL` | `app.aws.s3.public-url` | (vacío) | URL pública del bucket |
| `AWS_S3_PRESIGNED_EXPIRATION` | `app.aws.s3.presigned-url-expiration-minutes` | `15` | Duración en minutos de las presigned URLs |

**Seguridad:** Acceso restringido por IAM (solo `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` en prefijo `/products/*`). Las credenciales **nunca deben ser hardcodeadas**.

### Presigned URLs

Permiten que el cliente suba archivos directamente a S3 sin credenciales AWS:

1. Cliente solicita URL al backend
2. Backend genera presigned URL con expiración configurable
3. Cliente sube archivo directamente a S3
4. Cliente confirma la subida en el backend

---

## ⚙️ Entornos de ejecución

El proyecto usa Spring Profiles para gestionar la configuración por ambiente.

### Perfil `dev` (activo por defecto)

- `ddl-auto: update` — el esquema se actualiza automáticamente
- SQL visible en consola
- Logs detallados (DEBUG)

### Perfil `prod`

- `ddl-auto: validate` — solo valida el esquema
- Sin SQL en consola
- Logs reducidos

**Variables de entorno obligatorias en producción:**

| Variable de entorno | Descripción |
|---|---|
| `DB_URL` | URL JDBC de la base de datos |
| `DB_USER` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña de la base de datos |
| `SERVER_PORT` | Puerto del servidor HTTP |
| `AWS_REGION` | Región de AWS |
| `AWS_ACCESS_KEY_ID` | ID de clave de acceso IAM |
| `AWS_SECRET_ACCESS_KEY` | Clave secreta IAM |
| `AWS_S3_BUCKET_NAME` | Nombre del bucket S3 |
| `AWS_S3_PUBLIC_URL` | URL pública del bucket |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos para CORS |
| `API_KEY` | Clave de autenticación para APIs internas |

**Activar un perfil:**

```bash
# Via argumento
./gradlew bootRun --args='--spring.profiles.active=prod'

# Via variable de entorno
export SPRING_PROFILES_ACTIVE=prod
./gradlew bootRun
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

La API estará disponible en: `http://localhost:8080/api`

**Context path base:** `/api`

---

## 📖 Documentación de la API (Swagger)

La documentación completa de todos los endpoints está disponible en Swagger UI:

| Recurso | URL |
|---|---|
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8080/docs` |

La documentación está en español e incluye ejemplos de request/response.

### Formato de respuesta exitosa

Todas las respuestas exitosas incluyen el wrapper `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": { ... }
}
```

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

### Campo `version` — optimistic locking

Todas las respuestas de producto incluyen el campo `version`. Este número se incrementa automáticamente en cada modificación (gestionado por Hibernate). Su propósito es detectar conflictos de concurrencia: si dos procesos intentan modificar el mismo producto simultáneamente, el segundo recibirá un **409 Conflict**.

---

## 🚨 Estándar de errores — RFC 9457

Todos los errores de la API siguen el estándar **RFC 9457 — Problem Details for HTTP APIs**. Las respuestas de error usan `Content-Type: application/problem+json`.

### Estructura de un error

```json
{
  "type": "https://bodegatech.com/errors/not-found",
  "title": "Recurso no encontrado",
  "status": 404,
  "detail": "Producto con ID 'abc-123' no fue encontrado",
  "instance": "/api/products/abc-123",
  "timestamp": "2026-05-08T10:30:00"
}
```

Para errores de validación (400), el campo `errors` detalla cada campo inválido:

```json
{
  "type": "https://bodegatech.com/errors/validation-error",
  "title": "Errores de validación",
  "status": 400,
  "detail": "Se encontraron 2 errores de validación en la solicitud",
  "instance": "/api/products",
  "timestamp": "2026-05-08T10:30:00",
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
| `409 Conflict` | Error de negocio o conflicto de concurrencia |
| `500 Internal Server Error` | Error inesperado del servidor |

### Excepciones del sistema

| Excepción | HTTP | Descripción |
|---|---|---|
| `ResourceNotFoundException` | 404 | Recurso no encontrado |
| `BusinessException` | 409 | Conflicto de negocio |
| `CategoryInUseException` | 409 | Categoría con productos asignados |
| `SkuGenerationException` | 500 | Error en generación de SKU |

---

## 🎨 Frontend — BodegaTech UI

La aplicación frontend está construida con **Angular 21.2** y **Tailwind CSS v4** en la carpeta `frontend/`.

### Stack Frontend

| Tecnología | Descripción |
|---|---|
| Angular 21.2 | SPA con standalone components y signals |
| TypeScript + Signals | Estado reactivo |
| Tailwind CSS v4 | Estilos |
| SCSS | Estilos modulares |
| Lazy loading | Carga diferida de módulos |

### Requisitos Frontend

- **Node.js** 20+
- **pnpm** 10.30.3+

### Instalación

```bash
cd frontend
pnpm install
```

### Comandos

```bash
cd frontend

# Desarrollo (http://localhost:4200)
pnpm start

# Build producción (lint + build)
pnpm build

# Tests
pnpm test

# Lint
pnpm lint

# Lint con auto-fix
pnpm lint:fix

# Generar componente
pnpm ng generate component features/mi-feature/pages/mi-pagina --standalone --skip-tests
```

### Rutas principales

| Ruta | Descripción |
|---|---|
| `/login` | Autenticación |
| `/dashboard` | Panel principal |
| `/inventory` | Control de inventario |
| `/parametrization/products` | Gestión de productos |
| `/parametrization/categories` | Gestión de categorías |
| `/parametrization/units` | Gestión de unidades de medida |
| `/parametrization/suppliers` | Gestión de proveedores |
| `/reports` | Reportes |
| `/admin` | Administración |

### API Backend

Por defecto, el frontend consume la API en `http://localhost:8080/api`. Configurable en `src/environments/environment.ts`.

---

## ☁️ Terraform — Infraestructura AWS

Configuración de infraestructura como código en `terraform/`.

### Recursos creados

- **S3 Bucket** — Almacenamiento de imágenes (`felipecorp-bodegatech-{env}-uploads`)

### Variables

| Variable | Default | Descripción |
|---|---|---|
| `region` | `us-east-1` | Región de AWS |
| `org_name` | `felipecorp` | Nombre de organización |
| `project_name` | `bodegatech` | Nombre del proyecto |
| `environment` | `dev` | Entorno (dev, staging, prod) |
| `backend_api_url` | — | URL del backend para Lambda callback (Usar `ngrok http 8080` en dev) |
| `internal_api_key` | — | Clave secreta para autenticación Lambda |
| `webp_quality` | `80` | Calidad de compresión WebP (1-100) |
| `sns_topic_arn` | `""` | ARN del topic SNS para alarmas (opcional) |

### Comandos

```bash
cd terraform

# Formatea el código con el estándar de HashiCorp. Estética y alineación de texto
terraform fmt -recursive

# Inicializar
terraform init
```

Generar un plan especulativo de ejecución

```bash
# Generar el plan y lo guarda con el nombre dado
terraform plan -out plan.out

# Plan de cambios con variables
terraform plan -out plan.out -var="environment=dev"
```

Aplicar cambios
```bash
terraform apply "plan.out" -var="environment=dev"

terraform apply "plan.out"
```

Destruir recursos
```bash
terraform destroy -var="environment=dev"

terraform destroy
```

> **Nota:** Credenciales AWS deben estar configuradas en el entorno (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`).

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
./gradlew test

# Tests con reporte de cobertura (JaCoCo)
./gradlew test jacocoTestReport
```

El reporte de cobertura se genera en: `build/reports/jacoco/test/html/index.html`.

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
