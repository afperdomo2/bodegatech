# BodegaTech

BodegaTech es una aplicación desarrollada en **Spring Boot 4.0.5** con Java 25, diseñada para gestionar operaciones de bodega y almacén.

## Requisitos Previos

- **Java 25** o superior
- **Gradle** (incluido en el proyecto)
- **Docker** (para base de datos PostgreSQL)
- **Git**

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd bodegatech
```

### 2. Iniciar la Base de Datos (PostgreSQL con Docker)

```bash
docker-compose up -d
```

Esto iniciará PostgreSQL en `localhost:5432` con:
- Base de datos: `bodegatech_db`
- Usuario: `bodegatech_user`
- Contraseña: `bodegatech_password`

### 3. Compilar el Proyecto

```bash
./gradlew clean build
```

### 4. Ejecutar la Aplicación

```bash
# En desarrollo (profile dev)
./gradlew bootRun

# O alternativamente
java -jar build/libs/bodegatech-0.0.1-SNAPSHOT.jar
```

La aplicación se ejecutará en `http://localhost:8080` (puerto por defecto).

### 5. Acceder a Swagger

Una vez que la aplicación esté ejecutándose, accede a la documentación interactiva de la API en:

```
http://localhost:8080/swagger-ui.html
```

Para acceder a los documentos OpenAPI JSON:

```
http://localhost:8080/docs
```

## Estructura del Proyecto

```
bodegatech/
├── src/
│   ├── main/
│   │   ├── java/com/afperdomo/bodegatech/
│   │   │   ├── BodegatechApplication.java
│   │   │   ├── config/                                    # Configuración de la aplicación
│   │   │   │   ├── JpaConfig.java
│   │   │   │   └── OpenApiConfig.java
│   │   │   ├── shared/                                    # Código compartido
│   │   │   │   ├── audit/
│   │   │   │   │   └── BaseEntity.java                    # Entidad base con auditoría
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── BusinessException.java
│   │   │   │   │   └── ResourceNotFoundException.java
│   │   │   │   └── response/
│   │   │   │       ├── ApiResponse.java
│   │   │   │       └── PagedResponse.java
│   │   │   └── module/
│   │   │       └── product/                               # Módulo de productos
│   │   │           ├── controller/
│   │   │           │   └── ProductController.java
│   │   │           ├── service/
│   │   │           │   ├── ProductService.java
│   │   │           │   └── ProductServiceImpl.java
│   │   │           ├── repository/
│   │   │           │   └── ProductRepository.java
│   │   │           ├── entity/
│   │   │           │   └── Product.java
│   │   │           ├── dto/
│   │   │           │   ├── ProductRequest.java
│   │   │           │   └── ProductResponse.java
│   │   │           └── mapper/
│   │   │               └── ProductMapper.java
│   │   └── resources/
│   │       ├── application.yml                            # Configuración base
│   │       ├── application-dev.yml                        # Configuración desarrollo
│   │       └── application-prod.yml                       # Configuración producción
│   └── test/
│       └── java/com/afperdomo/bodegatech/
│           └── module/product/
│               ├── ProductControllerTest.java
│               └── ProductServiceTest.java
├── gradle/
├── docker-compose.yml                                     # Docker Compose para BD
├── build.gradle
├── settings.gradle
└── README.md
```

Para más detalles sobre la arquitectura del proyecto, consulta [ARQUITECTURE.md](./ARQUITECTURE.md).

## Características Principales

- **Gestión de Productos**: Crear, actualizar, listar y desactivar productos
- **Paginación**: Listas con soporte para paginación y ordenamiento
- **Auditoría**: Seguimiento automático de creación y actualización
- **Manejo de Errores**: Sistema centralizado de excepciones y respuestas
- **Documentación API**: Swagger/OpenAPI con documentación en español
- **Base de Datos**: PostgreSQL con Hibernate/JPA
- **Validación**: Validación de datos de entrada con anotaciones Jakarta

## Dependencias Principales

- **Spring Boot 4.0.5**: Framework principal
- **Spring Data JPA**: Acceso a datos y ORM
- **PostgreSQL Driver**: Driver para base de datos PostgreSQL
- **Springdoc OpenAPI**: Documentación Swagger 3
- **Lombok**: Reducción de código boilerplate
- **MapStruct**: Mapeo entre entidades y DTOs
- **JUnit 5**: Framework de pruebas
- **Mockito**: Mocking para pruebas unitarias

## Perfiles de Configuración

El proyecto usa Spring Profiles para diferentes ambientes:

- **dev**: Desarrollo local con `ddl-auto: update` y logs detallados
- **prod**: Producción con `ddl-auto: validate` y logs minimizados

Para ejecutar con un perfil específico:

```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

O con variables de entorno:

```bash
export SPRING_PROFILES_ACTIVE=dev
./gradlew bootRun
```

## Pruebas

Para ejecutar todas las pruebas:

```bash
./gradlew test
```

Para ejecutar pruebas con reporte de cobertura:

```bash
./gradlew test jacocoTestReport
```

Las pruebas incluyen:
- **Tests Unitarios**: `ProductServiceTest` - Pruebas del servicio de negocio
- **Tests de Integración**: `ProductControllerTest` - Pruebas del controlador REST

## Manejo de Errores

La API retorna errores estandarizados:

```json
{
  "success": false,
  "message": "Descripción del error",
  "data": null
}
```

**Códigos HTTP usados:**
- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `204 No Content`: Solicitud exitosa sin contenido (DELETE)
- `400 Bad Request`: Datos inválidos
- `404 Not Found`: Recurso no encontrado
- `422 Unprocessable Entity`: Error de validación de negocio
- `500 Internal Server Error`: Error interno del servidor

## Construcción para Producción

```bash
./gradlew build
```

El archivo JAR compilado estará disponible en `build/libs/`.

## Contribución

Para contribuir al proyecto:

1. Realiza un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto se encuentra bajo licencia propietaria. Consulta con el propietario para más información.

## Contacto

Para preguntas o soporte, contacta a: [afperdomo@example.com]

## Changelog

### v0.0.1-SNAPSHOT
- Versión inicial del proyecto
- Módulo de productos completamente funcional
- Autenticación en desarrollo (preparado para JWT)
- Documentación Swagger en español
- Tests unitarios e integración
- Docker Compose para PostgreSQL
- Manejo centralizado de excepciones
