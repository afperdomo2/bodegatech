# Arquitectura de BodegaTech

## Descripción General

BodegaTech es una aplicación Spring Boot diseñada siguiendo principios de arquitectura modular y escalable. El proyecto utiliza Java 25 como lenguaje de programación y Gradle como herramienta de construcción.

## Stack Tecnológico

| Componente | Versión | Descripción |
|-----------|---------|------------|
| Java | 25 | Lenguaje de programación principal |
| Spring Boot | 4.0.5 | Framework web y aplicativo |
| Spring Data JPA | 4.0.5 | ORM y acceso a datos |
| PostgreSQL | 16 | Base de datos relacional |
| Lombok | 1.18.x | Reducción de boilerplate |
| MapStruct | 1.6.0 | Mapeo entre DTOs y entidades |
| Springdoc OpenAPI | 2.6.0 | Documentación Swagger 3 |
| Gradle | 8.x+ | Herramienta de construcción |
| JUnit | 5.x | Framework de pruebas |
| Mockito | 5.x | Mocking para pruebas |
| Jakarta | 3.x | API estándar Java EE |

## Estructura del Proyecto

### Directorios Principales

```
bodegatech/
├── src/
│   ├── main/
│   │   ├── java/com/afperdomo/bodegatech/
│   │   │   ├── BodegatechApplication.java           # Clase principal
│   │   │   ├── config/
│   │   │   │   ├── JpaConfig.java                   # Configuración JPA y auditoría
│   │   │   │   └── OpenApiConfig.java               # Configuración Swagger/OpenAPI
│   │   │   ├── shared/
│   │   │   │   ├── audit/
│   │   │   │   │   └── BaseEntity.java              # Entidad base con auditoría
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java  # Manejador global de excepciones
│   │   │   │   │   ├── BusinessException.java
│   │   │   │   │   └── ResourceNotFoundException.java
│   │   │   │   └── response/
│   │   │   │       ├── ApiResponse.java             # Wrapper de respuestas
│   │   │   │       └── PagedResponse.java           # Respuesta paginada
│   │   │   └── module/
│   │   │       └── product/
│   │   │           ├── controller/
│   │   │           │   └── ProductController.java   # Endpoints REST
│   │   │           ├── service/
│   │   │           │   ├── ProductService.java      # Interfaz del servicio
│   │   │           │   └── ProductServiceImpl.java   # Implementación
│   │   │           ├── repository/
│   │   │           │   └── ProductRepository.java   # Acceso a datos (JPA)
│   │   │           ├── entity/
│   │   │           │   └── Product.java             # Entidad JPA
│   │   │           ├── dto/
│   │   │           │   ├── ProductRequest.java      # DTO entrada
│   │   │           │   └── ProductResponse.java     # DTO salida
│   │   │           └── mapper/
│   │   │               └── ProductMapper.java       # Mapeos con MapStruct
│   │   │
│   │   └── resources/
│   │       ├── application.yml                      # Configuración base
│   │       ├── application-dev.yml                  # Perfil desarrollo
│   │       └── application-prod.yml                 # Perfil producción
│   │
│   └── test/
│       └── java/com/afperdomo/bodegatech/
│           └── module/product/
│               ├── ProductServiceTest.java          # Tests unitarios
│               └── ProductControllerTest.java       # Tests integración
│
├── docker-compose.yml                               # Docker Compose
├── build.gradle                                     # Gradle build
├── settings.gradle
└── README.md
```

## Patrones de Arquitectura

### 1. Patrón MVC (Model-View-Controller)

- **Model**: Entidades JPA (`Product`), DTOs (`ProductRequest`, `ProductResponse`)
- **View**: Respuestas JSON con `ApiResponse` y `PagedResponse`
- **Controller**: `ProductController` con endpoints REST

### 2. Patrón Service (Lógica de Negocio)

La lógica de negocio está centralizada en servicios (`ProductService`), separada del controlador:

```java
@Service
@Transactional
public class ProductServiceImpl implements ProductService {
    // Lógica de negocio
}
```

### 3. Patrón Repository (Data Access Object)

Acceso a datos a través de JPA Spring Data:

```java
@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    Optional<Product> findBySku(String sku);
    Page<Product> findAllActive(Pageable pageable);
}
```

### 4. Patrón Mapper (DTO Conversion)

MapStruct para convertir entre entidades y DTOs:

```java
@Mapper(componentModel = "spring")
public interface ProductMapper {
    ProductResponse toResponse(Product product);
    Product toEntity(ProductRequest request);
}
```

### 5. Capas de la Aplicación

La arquitectura está organizada en capas lógicas:

```
┌─────────────────────────────────────┐
│        Capa de Presentación         │
│      (REST Controllers/Views)       │
└────────────────┬────────────────────┘
                 │
┌─────────────────────────────────────┐
│        Capa de Negocio              │
│      (Services/Business Logic)      │
└────────────────┬────────────────────┘
                 │
┌─────────────────────────────────────┐
│        Capa de Acceso a Datos       │
│      (Repositories/Database)        │
└────────────────┬────────────────────┘
                 │
┌─────────────────────────────────────┐
│      Base de Datos / Storage        │
└─────────────────────────────────────┘
```

## Clase Principal: BodegatechApplication

La clase `BodegatechApplication.java` es el punto de entrada de la aplicación. Contiene:

```java
@SpringBootApplication
public class BodegatechApplication {
    public static void main(String[] args) {
        SpringApplication.run(BodegatechApplication.class, args);
    }
}
```

- **@SpringBootApplication**: Anotación que combina `@Configuration`, `@EnableAutoConfiguration` y `@ComponentScan`
- **SpringApplication.run()**: Inicia la aplicación Spring Boot

## Dependencias Principales

### Spring Boot

- **spring-boot-starter-web**: Framework web con Servlet, Tomcat
- **spring-boot-starter-data-jpa**: ORM con Hibernate
- **spring-boot-starter-validation**: Validación de datos (Jakarta Validation)

### Base de Datos

- **postgresql**: Driver JDBC para PostgreSQL

### Documentación

- **springdoc-openapi-starter-webmvc-ui**: Swagger 3 / OpenAPI con interfaz gráfica

### Herramientas de Desarrollo

- **lombok**: Reducción de boilerplate con anotaciones
- **mapstruct**: Generación de mappers entre entidades y DTOs

### Testing

- **spring-boot-starter-test**: JUnit 5, Mockito, AssertJ
- **testcontainers**: Contenedores Docker para tests de integración

## Configuración

### Perfiles de Spring Boot

El proyecto soporta múltiples perfiles de configuración:

**application.yml** - Configuración base:
- Puerto: 8080
- Context path: /api
- DDL: update
- Logging: INFO/DEBUG

**application-dev.yml** - Desarrollo:
- Base de datos local: PostgreSQL en localhost:5432
- DDL: update (crea tablas automáticamente)
- Logs detallados: TRACE para SQL
- Swagger activo

**application-prod.yml** - Producción:
- Variables de entorno: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `SERVER_PORT`
- DDL: validate (no modifica esquema)
- Logs minimizados: WARN/INFO
- Más eficiente y seguro

### Ejemplo de configuración en producción:

```bash
java -jar bodegatech.jar \
  -Dspring.profiles.active=prod \
  -DDB_URL=jdbc:postgresql://db-prod:5432/bodegatech \
  -DDB_USER=prod_user \
  -DDB_PASSWORD=secure_password
```

## Módulo de Productos

### Estructura Completa

```
module/product/
├── controller/ProductController.java
│   └── Endpoints: GET, POST, PUT, DELETE con paginación
├── service/ProductService.java (interfaz)
├── service/ProductServiceImpl.java (implementación)
│   └── Lógica: crear, actualizar, listar, eliminar (soft delete)
├── repository/ProductRepository.java
│   └── Consultas: findAllActive, findByIdActive, findBySku
├── entity/Product.java (extiende BaseEntity)
│   └── Campos: id, name, description, price, stock, sku, category, imageUrl, isActive
├── dto/ProductRequest.java (validación para entrada)
├── dto/ProductResponse.java (salida serializable)
└── mapper/ProductMapper.java (MapStruct)
```

### Endpoints

| Método | Ruta | Descripción | Response |
|--------|------|-------------|----------|
| GET | `/products` | Listar con paginación | PagedResponse<ProductResponse> |
| GET | `/products/{id}` | Obtener por ID | ProductResponse |
| POST | `/products` | Crear | ProductResponse (201) |
| PUT | `/products/{id}` | Actualizar | ProductResponse |
| DELETE | `/products/{id}` | Desactivar (soft) | 204 No Content |

### Validaciones

**ProductRequest:**
- `name`: @NotBlank (requerido)
- `price`: @Positive (mayor a 0)
- `stock`: @Min(0) (no negativo)
- `sku`: @NotBlank y unique

### Manejo de Errores

```json
// 404 - Recurso no encontrado
{
  "success": false,
  "message": "Producto no encontrado con ID: ..."
}

// 422 - Error de negocio (SKU duplicado)
{
  "success": false,
  "message": "Ya existe un producto con el SKU: ...",
  "data": { "code": "DUPLICATE_SKU" }
}

// 400 - Validación fallida
{
  "success": false,
  "message": "Error de validación en los datos enviados",
  "data": { "name": "El nombre del producto es obligatorio" }
}
```

## Auditoría y Timestamps

### BaseEntity

Todas las entidades heredan de `BaseEntity`:

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

- `id`: UUID generado automáticamente
- `createdAt`: Establecido en creación, nunca actualizado
- `updatedAt`: Establecido en creación y actualización

## Paginación

### Parámetros

```
GET /api/products?page=0&size=10&sortBy=createdAt&direction=DESC
```

| Parámetro | Defecto | Descripción |
|-----------|---------|------------|
| page | 0 | Número de página (0-indexed) |
| size | 10 | Elementos por página |
| sortBy | createdAt | Campo para ordenar |
| direction | DESC | ASC o DESC |

### Respuesta

```json
{
  "success": true,
  "message": "Productos obtenidos exitosamente",
  "data": {
    "content": [ {...}, {...} ],
    "page": 0,
    "size": 10,
    "totalElements": 42,
    "totalPages": 5,
    "last": false
  }
}
```

## Flujo de Ejecución

```
1. Gradle inicia BodegatechApplication
   ↓
2. Spring Boot inicializa el contexto
   ↓
3. JpaConfig: Habilita auditoría (@EnableJpaAuditing)
   ↓
4. OpenApiConfig: Carga documentación Swagger
   ↓
5. Component Scanning: Detecta Controllers, Services, Repositories
   ↓
6. Inyección de Dependencias: Resuelve @Autowired y constructor injection
   ↓
7. Servidor Tomcat escucha en puerto 8080
   ↓
8. Aplicación lista para recibir solicitudes HTTP
```

## Convenciones de Código

## Convenciones de Código

### Nomenclatura de Paquetes

```
com.afperdomo.bodegatech
├── config/                 # Configuración de Spring
├── shared/
│   ├── audit/             # Entidades base con auditoría
│   ├── exception/         # Excepciones personalizadas
│   ├── response/          # Wrappers de respuesta
│   └── security/          # Seguridad (JWT, auth, etc.)
└── module/
    └── {modulo}/
        ├── controller/    # REST Controllers
        ├── service/       # Lógica de negocio
        ├── repository/    # Acceso a datos (JPA)
        ├── entity/        # Entidades JPA
        ├── dto/           # Data Transfer Objects
        └── mapper/        # Mapeos (MapStruct)
```

### Nomenclatura de Clases

- **Controllers**: `*Controller` (ej: `ProductController`)
- **Services**: `*Service` (interfaz), `*ServiceImpl` (implementación)
- **Repositories**: `*Repository` (ej: `ProductRepository`)
- **Entities**: sin sufijo (ej: `Product`)
- **DTOs**: `*Request`, `*Response` (ej: `ProductRequest`, `ProductResponse`)
- **Mappers**: `*Mapper` (ej: `ProductMapper`)
- **Exceptions**: `*Exception` (ej: `ResourceNotFoundException`)
- **Handlers**: `*Handler` (ej: `GlobalExceptionHandler`)

### Anotaciones Comunes

| Anotación | Uso |
|-----------|-----|
| `@RestController` | Declara un controlador REST |
| `@Service` | Declara un servicio (bean) |
| `@Repository` | Declara un repositorio |
| `@Entity` | Declara una entidad JPA |
| `@RequiredArgsConstructor` | Lombok: constructor con final fields |
| `@Mapper` | MapStruct: define un mapper |
| `@Transactional` | Gestiona transacciones |
| `@Validated` | Activa validación en parámetros |

## Gestión de Dependencias

El proyecto utiliza Gradle con el plugin `io.spring.dependency-management`:

```gradle
plugins {
    id 'org.springframework.boot' version '4.0.5'
    id 'io.spring.dependency-management' version '1.1.7'
}
```

**Beneficios:**
- Versionado automático de dependencias
- Compatible con versiones de Spring Boot
- Sin conflictos de versiones

## Ciclo de Vida

### Startup

1. Lectura de configuración (`application-{profile}.yml`)
2. Inicialización de beans según `@Component`, `@Service`, `@Repository`
3. Inyección de dependencias
4. Ejecución de métodos `@PostConstruct`
5. Tomcat escucha en puerto configurado
6. Swagger disponible en `/swagger-ui.html`

### Shutdown

1. Recepción de señal de cierre (SIGTERM)
2. Graceful shutdown: termina solicitudes en curso
3. Cierre de conexiones a BD
4. Ejecuta métodos `@PreDestroy`
5. Proceso Java termina

## Mejores Prácticas Implementadas

### 1. Inyección de Dependencias (Constructor)

```java
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository repository;
    private final ProductMapper mapper;
    // Automáticamente inyectado por constructor
}
```

**Ventajas:**
- Campos inmutables (final)
- Testing más fácil
- No hay sorpresas con NPE

### 2. Separación de Responsabilidades

- **Controller**: HTTP, validación de entrada, estado HTTP
- **Service**: Lógica de negocio, transacciones
- **Repository**: Acceso a datos, consultas SQL/JPA
- **Mapper**: Conversión entre capas

### 3. Transacciones

```java
@Service
@Transactional
public class ProductServiceImpl {
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> findAllProducts(Pageable pageable) {
        // ...
    }
}
```

**Beneficios:**
- Rollback automático en excepciones
- Consistency garantizada
- readOnly: optimización para SELECT

### 4. Validación en Capas

```java
// DTOs: Anotaciones Jakarta Validation
@NotBlank(message = "El nombre es obligatorio")
private String name;

// GlobalExceptionHandler: Captura errores
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ApiResponse<Map<String, String>>> handleMethodArgumentNotValid(...) {
    // Retorna errores en formato estándar
}
```

### 5. Logging

```java
@Slf4j
@Service
public class ProductServiceImpl {
    public ProductResponse createProduct(ProductRequest request) {
        log.info("Creando nuevo producto con SKU: {}", request.getSku());
        // ...
        log.info("Producto creado exitosamente con ID: {}", savedProduct.getId());
    }
}
```

**Niveles:**
- `ERROR`: Errores que requieren atención
- `WARN`: Situaciones anormales
- `INFO`: Eventos importantes
- `DEBUG`: Información de debug (dev)
- `TRACE`: Información muy detallada (dev)

## Seguridad

### Implementadas

- **Validación de entrada**: Anotaciones Jakarta en DTOs
- **Manejo de excepciones**: GlobalExceptionHandler previene exposición de detalles
- **SQL Injection**: Protegido por JPA/Hibernate parameterizado
- **CORS**: Configurable en producción

### Recomendadas para Producción

- **HTTPS/TLS**: Tráfico encriptado
- **Spring Security**: Autenticación y autorización
- **JWT**: Token stateless para API
- **Rate Limiting**: Prevenir abuso
- **OWASP**: Seguir top 10 vulnerabilidades

## Escalabilidad

### Consideraciones Presentes

- Paginación en listados (no cargar todo en memoria)
- Índices en BD: sku, isActive
- Lazy loading en relaciones (cuando agregue)
- Connection pooling de Hikari

### Mejoras Futuras

- **Caché**: Redis para productos frecuentes
- **Event sourcing**: Auditoría detallada
- **Mensajería**: RabbitMQ/Kafka para asincronía
- **Microservicios**: Separar módulos en servicios independientes
- **CQRS**: Query and Command segregation

## Monitoreo

### Logs Estructura

```
[TIMESTAMP] [LEVEL] [THREAD] [LOGGER] - MESSAGE
2024-01-15 10:30:45.123 INFO  [main] ProductServiceImpl - Creando nuevo producto con SKU: DELL-LAPTOP-001
```

### Niveles por Módulo (dev)

```yaml
logging:
  level:
    root: INFO
    com.afperdomo.bodegatech: DEBUG
    org.springframework.web: INFO
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

### Monitoreo Futuro (Spring Boot Actuator)

```
GET /actuator/health      - Estado de la aplicación
GET /actuator/metrics     - Métricas (RAM, CPU, requests)
GET /actuator/loggers     - Niveles de log en runtime
GET /actuator/env         - Variables de entorno
```

## Docker y Despliegue

### Docker Compose (dev)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports: 5432:5432
    volumes: postgres_data:/var/lib/postgresql/data
    healthcheck: pg_isready
```

**Uso:**

```bash
docker-compose up -d        # Inicia
docker-compose down         # Detiene
docker-compose logs -f      # Ver logs
```

### Opciones de Despliegue

1. **JAR Ejecutable**
   ```bash
   java -Dspring.profiles.active=prod -jar bodegatech.jar
   ```

2. **Docker (con Dockerfile)**
   ```bash
   docker build -t bodegatech:1.0 .
   docker run -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod bodegatech:1.0
   ```

3. **Kubernetes**
   - ConfigMaps para configuración
   - Secrets para credenciales
   - Services para networking

4. **Cloud Platforms**
   - AWS: EC2, ECS, Elastic Beanstalk
   - Azure: App Service, Container Instances
   - Google Cloud: Cloud Run, App Engine

## Testing

### Tipos de Tests

**Tests Unitarios** (`ProductServiceTest.java`):
- Mockito para dependencias
- Probando lógica de negocio aislada
- Sin BD, sin HTTP

```java
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    @Mock private ProductRepository repository;
    @InjectMocks private ProductServiceImpl service;
    
    @Test
    void testCreateProductSuccess() { ... }
}
```

**Tests de Integración** (`ProductControllerTest.java`):
- MockMvc para simular HTTP
- Validando respuestas JSON completas
- Sin acceso real a BD

```java
@WebMvcTest(ProductController.class)
class ProductControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private ProductService service;
    
    @Test
    void testGetAllProductsSuccess() throws Exception { ... }
}
```

### Cobertura

```bash
./gradlew test jacocoTestReport
# Reporte: build/reports/jacoco/test/html/index.html
```

**Objetivo**: >80% cobertura de lógica crítica

## Documentación

### Swagger/OpenAPI

**Acceso:** `http://localhost:8080/swagger-ui.html`

**Características:**
- Todas las operaciones documentadas en español
- Ejemplos de request/response
- Modelos interactivos
- Posibilidad de probar endpoints

**JSON Schema:** `http://localhost:8080/docs`

### Documentación de Código

- **Clases**: JavaDoc explicando propósito
- **Métodos públicos**: JavaDoc con @param, @return
- **Lógica compleja**: Comentarios inline
- **README.md**: Setup e instrucciones generales
- **ARQUITECTURE.md**: Este documento

## Conclusión

BodegaTech implementa una arquitectura modular, escalable y mantenible usando Spring Boot 4.0.5. Siguiendo las convenciones establecidas, es fácil agregar nuevos módulos con la misma estructura (auth, user, inventory, etc.).

**Próximos pasos recomendados:**
1. Implementar Spring Security + JWT
2. Agregar módulo de usuarios
3. Agregar módulo de autenticación
4. Caché con Redis
5. Pruebas de carga
