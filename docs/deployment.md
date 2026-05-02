# Deployment — BodegaTech

## Prerequisitos

- Docker y Docker Compose instalados
- Java 25
- Node.js 22+ con pnpm 10.30.3+

## Desarrollo local

```bash
# 1. Levantar base de datos
docker-compose up -d

# 2. Backend
./gradlew bootRun
# Activa perfil 'dev' por defecto: ddl-auto=update, logs detallados

# 3. Frontend (en otra terminal)
cd frontend
pnpm start
```

## Build de producción

### Backend
```bash
docker-compose up -d       # BD requerida para validación
./gradlew clean build      # incluye tests
# JAR → build/libs/bodegatech-*.jar
```

### Frontend
```bash
cd frontend
pnpm build
# Artefacto → frontend/dist/bodegatech-ui/
```

## Variables de entorno — perfil `prod`

El perfil `prod` usa `ddl-auto: validate` (no modifica el esquema). Requiere estas variables:

| Variable | Descripción |
|----------|-------------|
| `DB_URL` | JDBC URL de PostgreSQL |
| `DB_USER` | Usuario de la BD |
| `DB_PASSWORD` | Contraseña de la BD |
| `SERVER_PORT` | Puerto del servidor (ej: `8080`) |

Activar perfil: `java -jar bodegatech.jar --spring.profiles.active=prod`

## Docker Compose

El `docker-compose.yml` en la raíz levanta PostgreSQL 16. Verificar que el puerto 5432 no esté ocupado antes de correr.

## Tests con Testcontainers

Los tests de integración del backend usan Testcontainers (PostgreSQL). Requieren Docker corriendo. Si Docker no está disponible, los tests fallan con error de conexión, no de compilación.

```bash
# Solo tests, sin build completo
./gradlew test

# Reporte de cobertura JaCoCo
./gradlew jacocoTestReport
# → build/reports/jacoco/test/html/index.html
```

## CI — GitHub Actions

### Frontend CI (`frontend-ci.yml`)

Se activa automáticamente en:
- **Push** a ramas `main`, `develop` (si hay cambios en `frontend/`)
- **Pull Request** a ramas `main`, `develop` (si hay cambios en `frontend/`)

**Pasos del workflow:**
1. Checkout del código
2. Setup pnpm 10.30.3 + Node.js 22
3. `pnpm install --frozen-lockfile` — descarga dependencias (lockfile es inmutable en CI)
4. `pnpm lint` — ESLint
5. `pnpm build` — lint + build producción (mismo orden que local)
6. `pnpm test` — tests unitarios

**Implicación para agentes:**
- Si cambias `frontend/package.json`, **debes actualizar `frontend/pnpm-lock.yaml`** o el CI falla en step 3
- El lint falla el build (`pnpm build = ng lint && ng build`) — no hay segunda oportunidad
- No hay CI de backend — tests de backend solo corren localmente con `./gradlew test`

