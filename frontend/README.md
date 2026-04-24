# BodegaTech UI

Aplicación frontend para la plataforma de gestión de inventario **BodegaTech**, construida con **Angular 20+** y **Tailwind CSS**.

## 📋 Contenidos

1. [Requisitos previos](#requisitos-previos)
2. [Instalación](#instalación)
3. [Ejecución](#ejecución)
4. [Estructura de carpetas](#estructura-de-carpetas)
5. [Pautas de desarrollo](#pautas-de-desarrollo)
6. [Generar componentes](#generar-componentes)
7. [Build y deployment](#build-y-deployment)

---

## ✅ Requisitos previos

- **Node.js** 22+ (incluido pnpm 10.30.3+)
- **pnpm** instalado globalmente: `npm install -g pnpm`
- **Angular CLI** instalado: `pnpm add -g @angular/cli`
- Backend en `http://localhost:8080/api` (configurable)

---

## 📥 Instalación

```bash
cd frontend
pnpm install
```

---

## 🚀 Ejecución

```bash
# Servidor de desarrollo en http://localhost:4200
pnpm start

# O con Angular CLI directamente
pnpm ng serve
```

La aplicación se abrirá automáticamente en el navegador. **Hot reload** está habilitado: los cambios se reflejan al instante.

---

## 🗂 Estructura de carpetas

```
src/app/
├── core/
│   ├── services/
│   │   └── api.ts              # Servicio HTTP global
│   └── models/                 # Interfaces globales
│
├── shared/
│   ├── components/             # Componentes reutilizables (bt-*)
│   │   ├── page-header/
│   │   ├── stat-card/
│   │   ├── data-table/
│   │   └── badge/
│   ├── directives/             # Directivas personalizadas
│   ├── pipes/                  # Pipes personalizados
│   └── utils/                  # Utilidades y helpers
│
├── layout/
│   ├── sidebar/               # Menú lateral
│   ├── topbar/                # Barra superior
│   └── main-layout/           # Layout principal
│
├── features/                  # Módulos de negocio (lazy loading)
│   ├── dashboard/
│   │   ├── pages/dashboard/   # Componente principal
│   │   └── dashboard.routes.ts
│   └── inventory/
│       ├── pages/inventory/   # Componente principal
│       └── inventory.routes.ts
│
├── app.routes.ts              # Configuración de rutas
├── app.config.ts              # Configuración de providers
├── app.ts                     # Componente raíz
└── app.scss                   # Estilos globales

src/environments/
├── environment.ts             # Configuración desarrollo
└── environment.prod.ts        # Configuración producción

src/styles/                    # Estilos globales
└── tailwind.css              # Configuración Tailwind
```

---

## 💻 Pautas de desarrollo

### 1. Componentes Standalone
Todos los componentes nuevos deben ser **standalone**:

```typescript
@Component({
  selector: 'bt-mi-componente',
  imports: [CommonModule, FormsModule],
  template: '...',
  styleUrl: './mi-componente.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiComponenteComponent { }
```

### 2. Signals para estado reactivo
Usar `signal()` y `computed()` en lugar de observables cuando sea posible:

```typescript
import { signal, computed } from '@angular/core';

export class MiComponente {
  contador = signal(0);
  duplicado = computed(() => this.contador() * 2);
  
  incrementar() {
    this.contador.update(v => v + 1);
  }
}
```

### 3. Prefijo `bt-` obligatorio
Todos los selectores de componentes deben usar este prefijo:

```typescript
@Component({
  selector: 'bt-card',  // ✅ Correcto
  // selector: 'app-card', ❌ Incorrecto
})
```

### 4. Lazy Loading
Los features se cargan bajo demanda. Declarar rutas en `app.routes.ts`:

```typescript
const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
];
```

### 5. SCSS modular
Cada componente tiene su propio archivo SCSS. Las variables globales van en `src/styles/`.

```scss
// bt-card/card.scss
.card {
  @apply bg-white rounded-lg shadow p-4;
}
```

### 6. Tailwind first
Preferir clases de Tailwind sobre CSS personalizado:

```html
<!-- ✅ Preferible -->
<div class="bg-blue-500 text-white px-4 py-2 rounded-lg">

<!-- ❌ Evitar -->
<div class="custom-button">
```

---

## 🔧 Generar componentes

### Generar un componente
```bash
pnpm ng generate component features/dashboard/pages/dashboard --standalone --skip-tests
```

Genera:
- `dashboard.ts` — componente
- `dashboard.html` — template
- `dashboard.scss` — estilos

### Generar un servicio
```bash
pnpm ng generate service core/services/product
```

### Generar otros artefactos
```bash
pnpm ng generate directive shared/directives/highlight
pnpm ng generate pipe shared/pipes/currency-format
pnpm ng generate interface core/models/user
pnpm ng generate guard core/guards/auth
```

---

## 🏗 Build y deployment

### Build de desarrollo
```bash
pnpm build
# O: pnpm ng build
```

Output en `dist/bodegatech-ui/`

### Build de producción
```bash
pnpm build -- --configuration=production
```

Optimizaciones:
- Bundling y minificación
- Tree-shaking de código muerto
- Compresión de assets

---

## 🔗 Configuración de API

Por defecto, la aplicación consume la API en `http://localhost:8080/api`.

Modificar en `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',  // Cambiar aquí
};
```

Para producción, editar `src/environments/environment.prod.ts`.

---

## 📝 Convenciones de nombres

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Archivo componente | `kebab-case.ts` | `stat-card.ts` |
| Clase componente | `PascalCaseComponent` | `StatCardComponent` |
| Selector | `bt-kebab-case` | `bt-stat-card` |
| Servicio | `*Service` | `ApiService` |
| Interface | `PascalCase` | `Product`, `StatCard` |

---

## 🐛 Troubleshooting

**Error: "Cannot find module '@angular/core'"**
```bash
pnpm install
```

**Tailwind CSS no funciona**
```bash
pnpm build
# Rebuild a veces es necesario
```

**Puerto 4200 ocupado**
```bash
pnpm ng serve --port 4201
```

---

## 📚 Recursos

- [Angular Docs](https://angular.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Angular CLI](https://angular.io/cli)
- [Signals](https://angular.dev/guide/signals)
