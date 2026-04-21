# BodegaTech

BodegaTech es una aplicación desarrollada en **Spring Boot 4.0.5** con Java 25, diseñada para gestionar operaciones de bodega y almacén.

## Requisitos Previos

- **Java 25** o superior
- **Gradle** (incluido en el proyecto)
- **Git**

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd bodegatech
```

### 2. Compilar el Proyecto

```bash
./gradlew build
```

### 3. Ejecutar la Aplicación

```bash
./gradlew bootRun
```

La aplicación se ejecutará en `http://localhost:8080` (puerto por defecto).

## Estructura del Proyecto

```
bodegatech/
├── src/
│   ├── main/
│   │   └── java/com/afperdomo/bodegatech/
│   │       └── BodegatechApplication.java
│   └── test/
│       └── java/com/afperdomo/bodegatech/
│           └── BodegatechApplicationTests.java
├── gradle/
├── build.gradle
├── settings.gradle
└── README.md
```

Para más detalles sobre la arquitectura del proyecto, consulta [ARQUITECTURE.md](./ARQUITECTURE.md).

## Características Principales

- Gestión de inventario
- Control de almacén
- Interfaz de usuario intuitiva

## Dependencias

- **Spring Boot Starter**: Framework base para la aplicación
- **JUnit**: Framework de pruebas unitarias

## Pruebas

Para ejecutar las pruebas unitarias:

```bash
./gradlew test
```

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
