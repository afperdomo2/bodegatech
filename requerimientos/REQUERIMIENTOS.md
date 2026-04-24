# 📋 BodegaTech — Requerimientos del Sistema

> Documento de alcance y requerimientos del proyecto. Sirve como referencia para planificar y priorizar el desarrollo. Se actualiza a medida que el proyecto evoluciona.

---

## 🎯 Objetivo del Proyecto

**BodegaTech** es un sistema de gestión de inventarios full stack diseñado para controlar el stock de productos en una o múltiples bodegas. El sistema permite registrar productos, gestionar entradas y salidas de inventario, administrar proveedores, y generar reportes sobre el estado del stock.

### Principios clave
- **Multi-bodega**: el diseño soporta múltiples bodegas/ubicaciones desde la arquitectura base.
- **Soft delete**: ningún registro se elimina físicamente; se desactiva para mantener trazabilidad.
- **Auditabilidad**: todas las entidades registran fecha de creación y última modificación.
- **API-first**: el backend expone una API REST documentada con OpenAPI/Swagger.

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Java 25 + Spring Boot 4.x + Gradle |
| **Base de datos** | PostgreSQL 16 (Docker) |
| **ORM / Persistencia** | Spring Data JPA + Hibernate |
| **Mapeo de objetos** | MapStruct 1.6 |
| **Documentación API** | SpringDoc OpenAPI 3.0.3 |
| **Utilidades** | Lombok |
| **Almacenamiento** | AWS S3 (imágenes de productos) |
| **Frontend** | Angular 20+ (standalone) + Tailwind CSS v4 |
| **Gestor de paquetes** | pnpm |
| **Reactividad** | Angular Signals |

---

## 🚀 MVP — Producto Mínimo Viable

El MVP es la versión funcional mínima que entrega valor real al usuario. Incluye los siguientes módulos completamente operativos:

### ✅ Criterios de aceptación del MVP

| # | Módulo | Descripción |
|---|--------|-------------|
| 1 | 🔐 **Autenticación** | Login con JWT, roles básicos (admin / operador) |
| 2 | 🗂️ **Parametrización** | CRUD de Categorías y Unidades de Medida completamente funcional en frontend |
| 3 | 📦 **Productos** | CRUD completo con imágenes (S3), SKU auto-generado, asignación de categoría y unidad |
| 4 | 🚚 **Proveedores** | CRUD de proveedores con datos de contacto |
| 5 | 🏭 **Bodegas** | CRUD de bodegas/ubicaciones |
| 6 | 📊 **Inventario** | Vista de stock actual por producto/bodega con búsqueda y filtros |
| 7 | 🏠 **Dashboard** | KPIs básicos: total productos, stock bajo, valor total del inventario |
| 8 | 👤 **Usuarios** | Gestión básica de usuarios y asignación de roles |

---

## 📦 Módulos Detallados

---

### 🔐 Módulo: Autenticación y Seguridad

**Objetivo:** Controlar el acceso al sistema mediante autenticación JWT y roles de usuario.

**Estado:** 🔧 Estructura base (página login creada, sin lógica real)

#### Funcionalidades
- [ ] Login con email y contraseña
- [ ] Generación y validación de JWT
- [ ] Refresh token
- [ ] Cierre de sesión (invalidación de token)
- [ ] Guard de rutas en frontend
- [ ] Roles: `ADMIN`, `OPERADOR` (extensible a más roles)
- [ ] Protección de endpoints por rol en backend

#### Entidades
```
User
├── id (UUID)
├── name (VARCHAR 100)
├── email (VARCHAR 150, único)
├── passwordHash (TEXT)
├── role (ENUM: ADMIN, OPERADOR)
├── isActive (BOOLEAN)
├── createdAt
└── updatedAt
```

#### Endpoints API
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Autenticación, retorna JWT |
| POST | `/api/auth/refresh` | Renovar token |
| POST | `/api/auth/logout` | Invalidar token |

---

### 🏠 Módulo: Dashboard

**Objetivo:** Pantalla de inicio con indicadores clave del estado del inventario para una vista rápida del negocio.

**Estado:** 🔧 Página placeholder, sin datos reales

#### Funcionalidades
- [ ] Total de productos registrados
- [ ] Productos con stock bajo (bajo el mínimo configurado)
- [ ] Valor total del inventario (suma de precio × stock)
- [ ] Top 5 productos con mayor stock
- [ ] Top 5 productos más recientes
- [ ] Distribución de productos por categoría (gráfico)
- [ ] Acceso rápido a acciones frecuentes

#### Pendiente backend
- [ ] Endpoint de resumen / métricas agregadas

---

### 🗂️ Módulo: Parametrización

Módulo de configuración base del sistema. Agrupa las entidades que sirven de catálogo para el resto de módulos.

---

#### 🏷️ Sub-módulo: Categorías

**Objetivo:** Clasificar los productos en grupos lógicos para facilitar la búsqueda y los reportes.

**Estado:** ✅ Implementado (backend + frontend)

##### Funcionalidades implementadas
- [x] Listar categorías con paginación y ordenamiento
- [x] Crear categoría (nombre único, descripción opcional)
- [x] Editar categoría (actualización parcial)
- [x] Desactivar categoría (soft delete — bloquea si tiene productos activos)
- [x] Activar/desactivar desde toggle en tabla

##### Entidad
```
Category
├── id (UUID)
├── name (VARCHAR 100, único)
├── description (TEXT)
├── isActive (BOOLEAN)
├── createdAt
└── updatedAt
```

##### Endpoints API
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/categories` | Listar con paginación |
| GET | `/api/categories/{id}` | Obtener por ID |
| POST | `/api/categories` | Crear |
| PATCH | `/api/categories/{id}` | Actualizar parcialmente |
| DELETE | `/api/categories/{id}` | Desactivar (soft delete) |

---

#### 📏 Sub-módulo: Unidades de Medida

**Objetivo:** Definir las unidades en las que se mide y comercializa cada producto (peso, volumen, longitud, cantidad, etc.).

**Estado:** ✅ Backend implementado / 🔧 Frontend pendiente

##### Funcionalidades implementadas
- [x] Listar unidades con paginación
- [x] Crear unidad (nombre, abreviación, tipo)
- [x] Editar unidad
- [x] Desactivar unidad (soft delete)
- [x] Soporte de unidad base + factor de conversión
- [ ] Pantalla frontend de gestión

##### Tipos de unidad (enum `UnitType`)
`WEIGHT` | `VOLUME` | `LENGTH` | `AREA` | `QUANTITY` | `TIME` | `TEMPERATURE` | `OTHER`

##### Entidad
```
MeasurementUnit
├── id (UUID)
├── name (VARCHAR 100, único)
├── abbreviation (VARCHAR 20, único)
├── type (ENUM: UnitType)
├── isBase (BOOLEAN)
├── baseUnit (FK → MeasurementUnit, nullable)
├── conversionFactor (DECIMAL 19,10, nullable)
├── isActive (BOOLEAN)
├── createdAt
└── updatedAt
```

##### Endpoints API
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/measurement-units` | Listar con paginación |
| GET | `/api/measurement-units/{id}` | Obtener por ID |
| POST | `/api/measurement-units` | Crear |
| PATCH | `/api/measurement-units/{id}` | Actualizar parcialmente |
| DELETE | `/api/measurement-units/{id}` | Desactivar (soft delete) |

---

### 📦 Módulo: Productos

**Objetivo:** Gestionar el catálogo de productos disponibles en las bodegas, incluyendo su información, imágenes, precio y stock.

**Estado:** ✅ Backend implementado / 🔧 Frontend pendiente

#### Funcionalidades implementadas
- [x] Listar productos con paginación y ordenamiento
- [x] Crear producto (nombre, descripción, precio, stock, SKU, categoría)
- [x] SKU auto-generado con lógica propia (`SkuGenerator`)
- [x] Editar producto (actualización parcial)
- [x] Desactivar producto (soft delete)
- [x] Gestión de imágenes vía AWS S3 (URLs pre-firmadas → confirmar carga → eliminar imagen)
- [ ] Asociación con unidad de medida
- [ ] Asociación con proveedor
- [ ] Stock mínimo configurable por producto
- [ ] Vista frontend del catálogo de productos
- [ ] Vista de detalle de producto con imágenes

#### Entidades
```
Product
├── id (UUID)
├── name (VARCHAR 255)
├── description (TEXT)
├── price (DECIMAL 10,2)
├── stock (INTEGER)
├── sku (VARCHAR 100, único)
├── category (FK → Category)
├── isActive (BOOLEAN)
├── createdAt
└── updatedAt

ProductImage
├── id (UUID)
├── product (FK → Product)
├── fileKey (TEXT)       ← key en S3
├── url (TEXT)           ← URL pública/pre-firmada
├── createdAt
└── updatedAt
```

#### Endpoints API
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar con paginación |
| GET | `/api/products/{id}` | Obtener detalle |
| POST | `/api/products` | Crear producto |
| PATCH | `/api/products/{id}` | Actualizar parcialmente |
| DELETE | `/api/products/{id}` | Desactivar (soft delete) |
| POST | `/api/products/{id}/images/presigned` | Generar URLs pre-firmadas S3 |
| POST | `/api/products/{id}/images/confirm` | Confirmar carga de imágenes |
| DELETE | `/api/products/{id}/images/{imageId}` | Eliminar imagen |

---

### 🚚 Módulo: Proveedores

**Objetivo:** Registrar y gestionar los proveedores que suministran productos a las bodegas.

**Estado:** 🔴 No iniciado

#### Funcionalidades
- [ ] Listar proveedores con paginación y búsqueda
- [ ] Crear proveedor
- [ ] Editar proveedor
- [ ] Desactivar proveedor (soft delete — bloquea si tiene productos activos)
- [ ] Asociar proveedores a productos
- [ ] Vista frontend de gestión de proveedores

#### Entidad propuesta
```
Supplier
├── id (UUID)
├── name (VARCHAR 150)
├── contactName (VARCHAR 100)
├── email (VARCHAR 150)
├── phone (VARCHAR 30)
├── address (TEXT)
├── taxId (VARCHAR 50)     ← NIT / RUC / RFC según país
├── isActive (BOOLEAN)
├── createdAt
└── updatedAt
```

#### Endpoints API propuestos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/suppliers` | Listar con paginación |
| GET | `/api/suppliers/{id}` | Obtener por ID |
| POST | `/api/suppliers` | Crear |
| PATCH | `/api/suppliers/{id}` | Actualizar |
| DELETE | `/api/suppliers/{id}` | Desactivar |

---

### 🏭 Módulo: Bodegas

**Objetivo:** Gestionar las ubicaciones físicas (bodegas, almacenes, sucursales) donde se almacenan los productos. El sistema es multi-bodega por diseño.

**Estado:** 🔴 No iniciado

#### Funcionalidades
- [ ] Listar bodegas
- [ ] Crear bodega (nombre, ubicación, responsable)
- [ ] Editar bodega
- [ ] Desactivar bodega
- [ ] Asignar responsable de bodega
- [ ] Vista frontend de gestión de bodegas

#### Entidad propuesta
```
Warehouse
├── id (UUID)
├── name (VARCHAR 150)
├── address (TEXT)
├── city (VARCHAR 100)
├── managerName (VARCHAR 100)
├── phone (VARCHAR 30)
├── isActive (BOOLEAN)
├── createdAt
└── updatedAt
```

#### Endpoints API propuestos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/warehouses` | Listar |
| GET | `/api/warehouses/{id}` | Obtener por ID |
| POST | `/api/warehouses` | Crear |
| PATCH | `/api/warehouses/{id}` | Actualizar |
| DELETE | `/api/warehouses/{id}` | Desactivar |

---

### 📊 Módulo: Inventario

**Objetivo:** Visualizar y controlar el stock de productos por bodega. El MVP contempla la consulta del inventario actual. Los movimientos (entradas/salidas) son una fase posterior.

**Estado:** 🔧 Página placeholder en frontend / backend no iniciado

#### MVP — Consulta de stock actual
- [ ] Vista de inventario: listado de productos con su stock por bodega
- [ ] Filtros: por categoría, por bodega, por rango de stock
- [ ] Búsqueda por nombre o SKU
- [ ] Indicador visual de stock bajo (cuando stock < stock mínimo del producto)
- [ ] Exportar inventario a CSV/Excel

#### Entidad propuesta (stock por bodega)
```
WarehouseStock
├── id (UUID)
├── product (FK → Product)
├── warehouse (FK → Warehouse)
├── quantity (INTEGER)
├── minStock (INTEGER)     ← umbral para alerta de stock bajo
├── createdAt
└── updatedAt
```

#### Post-MVP — Movimientos de inventario
- [ ] Registrar entradas de stock (compra a proveedor)
- [ ] Registrar salidas de stock (venta / consumo)
- [ ] Transferencia de stock entre bodegas
- [ ] Historial de movimientos con trazabilidad (usuario, fecha, motivo)

#### Entidad propuesta (movimientos — post-MVP)
```
StockMovement
├── id (UUID)
├── product (FK → Product)
├── warehouse (FK → Warehouse)
├── type (ENUM: ENTRY, EXIT, TRANSFER)
├── quantity (INTEGER)
├── previousStock (INTEGER)
├── newStock (INTEGER)
├── referenceId (UUID, nullable)   ← ID de orden de compra / venta
├── notes (TEXT)
├── createdBy (FK → User)
├── createdAt
└── updatedAt
```

---

### 📈 Módulo: Reportes

**Objetivo:** Generar informes sobre el estado del inventario, movimientos y valorización del stock.

**Estado:** 🔧 Página placeholder en frontend / backend no iniciado

#### Reportes contemplados
- [ ] **Reporte de inventario actual** — stock por producto y bodega con valorización
- [ ] **Reporte de productos con stock bajo** — alertas de reabastecimiento
- [ ] **Reporte de movimientos** — entradas y salidas en un rango de fechas (post-MVP)
- [ ] **Reporte por proveedor** — productos y montos por proveedor
- [ ] **Reporte por categoría** — distribución del inventario
- [ ] Exportación a PDF y Excel

---

### 👤 Módulo: Administración de Usuarios

**Objetivo:** Gestionar los usuarios del sistema y sus permisos de acceso.

**Estado:** 🔧 Página placeholder en frontend / backend no iniciado

#### Funcionalidades
- [ ] Listar usuarios
- [ ] Crear usuario con rol
- [ ] Editar usuario (nombre, email, rol)
- [ ] Activar / desactivar usuario
- [ ] Restablecer contraseña
- [ ] El administrador no puede desactivarse a sí mismo

#### Roles del sistema
| Rol | Descripción |
|-----|-------------|
| `ADMIN` | Acceso total al sistema, puede gestionar usuarios |
| `OPERADOR` | Puede registrar movimientos y consultar inventario, sin acceso a administración |

---

## 🔮 Funcionalidades Post-MVP

Estas funcionalidades no bloquean el MVP pero están contempladas para fases posteriores:

| Feature | Descripción |
|---------|-------------|
| 📲 **Notificaciones de stock bajo** | Alertas automáticas por email/push cuando un producto supera el umbral mínimo |
| 🔄 **Órdenes de compra** | Módulo para gestionar órdenes de compra a proveedores |
| 🏷️ **Códigos de barras / QR** | Escaneo de productos para agilizar movimientos de inventario |
| 🌍 **Multi-moneda** | Soporte de distintas monedas por bodega o proveedor |
| 📅 **Inventario físico** | Proceso de toma de inventario físico con ajuste de diferencias |
| 📊 **Analytics avanzado** | Gráficos de tendencias, proyecciones de stock, rotación de productos |
| 🔗 **Integraciones** | Integración con sistemas ERP, contables o e-commerce |
| 📱 **App móvil** | Versión mobile para operadores de bodega |
| 🔔 **Audit log** | Registro detallado de todas las acciones del sistema por usuario |

---

## 📐 Arquitectura y Convenciones

### Backend
- Estructura de módulos: `module/{nombre}/{controller,service,repository,entity,dto,mapper}/`
- Todas las entidades extienden `BaseEntity` (id UUID, createdAt, updatedAt)
- Soft delete: campo `isActive` en lugar de eliminación física
- Respuestas uniformes via `ApiResponse<T>` y `PagedResponse<T>`
- Validación con Bean Validation (`@Valid`, `@NotBlank`, etc.)
- Mapeo con MapStruct (sin lógica en mappers)
- Convención de nombres: `*Service` (interfaz) + `*ServiceImpl`, `*Request` (entrada), `*Response`/`*Dto` (salida)

### Frontend
- Componentes standalone con `signal()` para estado reactivo
- Prefijo `bt-` en todos los selectores
- Lazy loading por feature en `app.routes.ts`
- Patrón `*StateService` por feature para centralizar estado HTTP
- Modales centralizados via `ModalService` + `<bt-modal>` en `main-layout`
- Tailwind CSS v4 para estilos, SCSS modular por componente

### Base de datos
- Nombres de tablas en plural (`products`, `categories`, etc.)
- Índices con prefijo `idx_{tabla}_{campo}`
- Campos de texto libre sin límite: `columnDefinition = "TEXT"`
- UNIQUE constraint implica índice — no duplicar con `@Index`
