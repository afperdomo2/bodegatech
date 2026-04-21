# Arquitectura de BodegaTech

## Descripción General

BodegaTech es una aplicación Spring Boot diseñada siguiendo principios de arquitectura modular y escalable. El proyecto utiliza Java 25 como lenguaje de programación y Gradle como herramienta de construcción.

## Stack Tecnológico

| Componente | Versión | Descripción |
|-----------|---------|------------|
| Java | 25 | Lenguaje de programación principal |
| Spring Boot | 4.0.5 | Framework web y aplicativo |
| Gradle | 8.x+ | Herramienta de construcción |
| JUnit | 5.x | Framework de pruebas |

## Estructura del Proyecto

### Directorios Principales

```
bodegatech/
├── src/
│   ├── main/                          # Código fuente principal
│   │   └── java/
│   │       └── com/afperdomo/bodegatech/
│   │           └── BodegatechApplication.java     # Clase principal de la aplicación
│   │
│   └── test/                          # Código de pruebas
│       └── java/
│           └── com/afperdomo/bodegatech/
│               └── BodegatechApplicationTests.java
│
├── gradle/                            # Scripts y configuración de Gradle
├── build.gradle                       # Configuración de dependencias y construcción
├── settings.gradle                    # Configuración de módulos
├── gradlew                            # Gradle Wrapper (Unix)
├── gradlew.bat                        # Gradle Wrapper (Windows)
└── .gitignore                         # Archivos ignorados por Git
```

## Patrones de Arquitectura

### 1. Patrón MVC (Model-View-Controller)

Aunque el proyecto es actualmente minimalista, está configurado para implementar:

- **Model**: Clases de entidad y servicios de negocio
- **View**: Respuestas JSON o plantillas (según evolución)
- **Controller**: Manejadores de solicitudes HTTP

### 2. Capas de la Aplicación

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

### Spring Boot Starter

- **spring-boot-starter**: Dependencia base que incluye:
  - Spring Core
  - Logging (SLF4J + Logback)
  - YAML parsing

### Testing

- **spring-boot-starter-test**: Suite completa de pruebas incluyendo:
  - JUnit 5
  - Mockito
  - AssertJ
  - Spring Test

## Configuración

### application.properties / application.yml

La aplicación puede configurarse mediante:

```properties
# Servidor
server.port=8080
server.servlet.context-path=/api

# Logging
logging.level.root=INFO
logging.level.com.afperdomo.bodegatech=DEBUG

# Spring
spring.application.name=bodegatech
```

## Flujo de Ejecución

```
1. Gradle inicia la clase BodegatechApplication
   ↓
2. Spring Boot inicializa el contexto de aplicación
   ↓
3. Component Scanning: Detecta y registra beans
   ↓
4. Auto-configuration: Configura componentes automáticamente
   ↓
5. Aplicación lista para recibir solicitudes
```

## Convenciones de Código

### Nomenclatura de Paquetes

```
com.afperdomo.bodegatech
├── controller          # Controladores REST
├── service             # Servicios de negocio
├── repository          # Acceso a datos
├── model/entity        # Entidades/Modelos
├── dto                 # Data Transfer Objects
├── exception           # Excepciones personalizadas
└── config              # Configuración de la aplicación
```

### Nomenclatura de Clases

- **Controllers**: `*Controller` (ej: `ProductController`)
- **Services**: `*Service` (ej: `ProductService`)
- **Repositories**: `*Repository` (ej: `ProductRepository`)
- **Entities**: `*Entity` o sin sufijo (ej: `Product`)
- **DTOs**: `*DTO` o `*Request/Response` (ej: `ProductDTO`)
- **Exceptions**: `*Exception` (ej: `ProductNotFoundException`)

## Gestión de Dependencias

### Gradle Dependency Management

El proyecto utiliza el plugin `io.spring.dependency-management` que:

- Gestiona las versiones de dependencias automáticamente
- Proporciona versiones compatibles de Spring Boot

### Versión Java

- **Toolchain Java 25**: Asegura que el proyecto compile con Java 25
- Compatible con características más recientes del lenguaje

## Ciclo de Vida de la Aplicación

### Fases de Inicio

1. **Descubrimiento de Configuración**: Lee `application.properties` o `application.yml`
2. **Inicialización de Beans**: Crea instancias de componentes detectados
3. **Inyección de Dependencias**: Resuelve dependencias entre beans
4. **Ejecución de Métodos @PostConstruct**: Inicialización personalizada
5. **Aplicación Operativa**: Acepta solicitudes HTTP

### Fases de Cierre

1. **Cierre Ordenado**: Spring cierra beans en orden inverso
2. **Liberación de Recursos**: Cierra conexiones a BD, archivos, etc.
3. **Ejecución de Métodos @PreDestroy**: Limpieza personalizada

## Mejores Prácticas

### 1. Inyección de Dependencias

```java
@Service
public class ProductService {
    private final ProductRepository repository;
    
    // Constructor injection (recomendado)
    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }
}
```

### 2. Separación de Responsabilidades

- Controladores: Manejo de HTTP
- Servicios: Lógica de negocio
- Repositorios: Acceso a datos

### 3. Manejo de Excepciones

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ProductNotFoundException e) {
        // Manejo de error
    }
}
```

### 4. Validación

```java
public class CreateProductRequest {
    @NotBlank
    private String name;
    
    @Positive
    private BigDecimal price;
}
```

## Seguridad

### Configuraciones Recomendadas

- **HTTPS**: Usar en producción
- **CORS**: Configurar según necesidades
- **Spring Security**: Implementar autenticación y autorización
- **Validación de entrada**: Validar siempre datos de usuario

## Escalabilidad

### Consideraciones Futuras

- **Microservicios**: Dividir en servicios independientes
- **Caché**: Implementar Redis para datos frecuentes
- **Mensajería**: Usar RabbitMQ o Kafka para asincronía
- **Base de Datos**: Escalar horizontalmente con réplicas

## Monitoreo y Logs

### Spring Boot Actuator

Agregar para monitoreo:

```gradle
implementation 'org.springframework.boot:spring-boot-starter-actuator'
```

Endpoints útiles:
- `/actuator/health`: Estado de la aplicación
- `/actuator/metrics`: Métricas
- `/actuator/loggers`: Niveles de log

## Despliegue

### Opciones de Despliegue

1. **JAR Ejecutable**: `java -jar bodegatech.jar`
2. **Docker**: Crear imagen y ejecutar en contenedor
3. **Cloud**: AWS, Azure, Google Cloud, Heroku
4. **Servidor Tradicional**: Tomcat, Wildfly (si es WAR)

## Conclusión

BodegaTech utiliza Spring Boot como base sólida para desarrollar una aplicación escalable y mantenible. La arquitectura modular permite agregar nuevas funcionalidades de manera ordenada y predecible.
