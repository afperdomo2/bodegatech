# AGENTS.md — BodegaTech

## Reglas críticas (leer siempre)

- **NO hacer commits automáticos.** Preparar cambios y dejar que el usuario decida.
- **BD requerida antes de cualquier comando backend:** `docker-compose up -d`
- **Frontend:** todos los comandos npm/pnpm se ejecutan **dentro de `frontend/`**, no desde la raíz.
- `pnpm build` ejecuta `ng lint && ng build` — el lint falla el build si hay errores.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Java 25 + Spring Boot 4.0.5 + Gradle |
| BD | PostgreSQL 16 (Docker) |
| Mapeo | MapStruct 1.6.0 + Lombok |
| API Docs | SpringDoc OpenAPI **3.0.3** (3.x obligatorio — ver docs/backend.md) |
| Frontend | Angular **21.2** standalone + Tailwind CSS v4 + pnpm 10.30.3 |

## Comandos rápidos

```bash
# Backend
docker-compose up -d
./gradlew bootRun
./gradlew clean build -x test
./gradlew test jacocoTestReport

# Frontend (siempre desde frontend/)
cd frontend
pnpm start
pnpm build       # lint + build
pnpm lint:fix
pnpm ng generate component features/{feature}/pages/{page} --standalone --skip-tests
pnpm ng generate service core/services/{service}
```

## Documentación obligatoria — leer ANTES de planificar

> ⚠️ Leer el archivo correspondiente COMPLETO antes de planificar o escribir código.
> No asumir — la documentación tiene reglas y trampas que no son evidentes.

- **Arquitectura general, estructura de carpetas, perfiles de Spring:**
  leer `docs/architecture.md` antes de crear módulos, paquetes o perfiles nuevos.

- **Backend (Spring Boot, servicios, controladores, entidades, JPA, índices, queries):**
  leer `docs/backend.md` + cargar skills `java-springboot` y `postgresql-optimization`.

- **Frontend (componentes, signals, routing, DI, forms, HTTP, UI, Tailwind):**
  leer `docs/frontend.md` + cargar skills `angular-developer` y `frontend-design`.

- **Convenciones REST, DTOs, envelopes, códigos de error:**
  leer `docs/api-conventions.md` antes de crear o modificar cualquier endpoint o DTO.

- **Build de producción, variables de entorno, Testcontainers:**
  leer `docs/deployment.md` antes de tocar configuración de build, Docker o CI.

## Trampas frecuentes (resumen ejecutivo)

1. **SpringDoc 2.x** rompe Spring Boot 4.x — usar siempre 3.0.3.
2. **Tailwind v4:** `max-w-md` ≠ `max-w-[28rem]`. Usar siempre valores arbitrarios para tamaños.
3. **`<bt-modal>` y `<bt-toast>`** van en `main-layout.html` fuera del `<router-outlet>`.
4. **Modal de edición:** siempre cargar `GET /{id}` al abrir (datos frescos), nunca reutilizar datos del listado.
5. **Campos read-only** en modales: usar `<input readonly>` con `bg-surface-container cursor-not-allowed opacity-75`, no `<p>` plano.
6. **`GlobalExceptionHandler`** requiere checks de SpringDoc en `handleGlobalException` — ver `docs/backend.md`.
7. **MapStruct** requiere `annotationProcessor` además de `implementation` en `build.gradle`.
8. **Tests de integración** usan Testcontainers — Docker debe estar corriendo o fallan.
9. **Frontend lockfile:** si cambias `frontend/package.json`, debes actualizar `frontend/pnpm-lock.yaml` o el CI falla — usar `pnpm install` para actualizar ambos.
