# Frontend — BodegaTech UI

## Stack verificado

- Angular **21.2** (standalone components) — el `package.json` dice `^21.2.0`
- Tailwind CSS v4 — usa valores arbitrarios, no clases de contenedor estándar
- pnpm 10.30.3
- TypeScript 5.9

## Comandos esenciales

```bash
cd frontend   # ⚠️ SIEMPRE desde esta carpeta

pnpm start          # servidor de desarrollo
pnpm build          # lint + build producción (ng lint && ng build)
pnpm lint           # ESLint
pnpm lint:fix       # ESLint con auto-fix
pnpm test           # tests unitarios
pnpm ng generate component features/mi-feature/pages/mi-pagina --standalone --skip-tests
pnpm ng generate service core/services/mi-servicio
```

## Reglas críticas de Tailwind v4

⚠️ **NO usar** `max-w-md`, `w-sm`, `h-lg`, etc. — Tailwind v4 las interpreta como variables CSS `--spacing-*` (píxeles mínimos), no como tamaños de contenedor.

**Siempre usar valores arbitrarios explícitos:**
```html
max-w-[32rem]   w-[24rem]   max-h-[30rem]
```
Aplica a: `w-*`, `h-*`, `max-w-*`, `max-h-*`, `min-w-*`, `min-h-*`.

**Tamaños de modal definidos en el proyecto:**
| size | clase aplicada |
|------|---------------|
| `'sm'` | `max-w-[20rem]` |
| `'md'` | `max-w-[28rem]` |
| `'lg'` | `max-w-[32rem]` |
| `'xl'` | `max-w-[36rem]` |
| `'2xl'` | `max-w-[42rem]` |

## Convenciones de código

- Selector de todos los componentes: prefijo `bt-` (ej: `bt-modal`, `bt-data-table`)
- Archivos en kebab-case: `unit-form.component.ts`, `unit-state.service.ts`
- `pages/` y `layout/` → siempre 3 archivos (`.ts` + `.html` + `.scss`)
- `components/` internos de un feature → single-file si < ~150 líneas combinadas
- Sin `NgModule` — todo standalone
- Signals para estado: `signal()`, `computed()`, `effect()`; NO `BehaviorSubject` ni `Observable` de estado
- `FormsModule` + `[(ngModel)]` con signals locales para formularios en modales (no Reactive Forms)
- Minimizar comentarios — el código debe ser auto-documentado

## Patrón Smart/Dumb (componentización)

**Cuándo extraer sub-componentes:**
- HTML de página > 300 líneas
- TS > 250 líneas con validadores + efectos entrelazados
- Múltiples `ng-template` de modales inline

**Estructura de un feature componentizado:**
```
features/{modulo}/
├── components/
│   ├── {entity}-form.component.ts       ← formulario compartido create+edit
│   ├── {entity}-create-modal.component.ts
│   ├── {entity}-edit-modal.component.ts
│   ├── {entity}-delete-modal.component.ts
│   └── {entity}-related-table.component.ts
├── pages/{entity}/
│   ├── {entity}.ts    ← solo coordinación (~150 líneas)
│   ├── {entity}.html  ← solo layout + DataTable (~80 líneas)
│   └── {entity}.scss
└── state/
    └── {entity}-state.service.ts
```

**Regla Smart/Dumb:**
- La página (smart): único que inyecta `StateService`, coordina efectos y abre modales.
- Componentes hijos (dumb): solo `input()` y `output()`, validan localmente con `computed()`, NO inyectan `StateService`.

**Patrón TemplateRef para modales:**
Los componentes modal exponen `templateRef` via `@ViewChild('templateXxx') templateRef!: TemplateRef<unknown>` y el componente modal tiene `:host { display: none; }`. La página lee `modalComponent.templateRef` y lo pasa a `modalService.open()`.

**Patrón formulario reutilizable:**
- Signals locales para `ngModel` (`formNameLocal = signal('')`)
- `effect()` en constructor sincroniza inputs externos → signals locales
- Métodos públicos: `markAllTouched()`, `hasErrors` (computed), `getFormValues()`
- La página llama estos métodos via `@ViewChild(FormComponent) form!`

Referencia canónica: `features/parametrization/units/`

## State Service — patrón de signals

```typescript
// Privado (escribible)
private _items = signal<ItemDto[]>([]);
private _operationSuccess = signal(0);

// Público (readonly)
readonly items = this._items.asReadonly();
readonly operationSuccess = this._operationSuccess.asReadonly();
```

Al completarse una operación exitosa: `this._operationSuccess.update(v => v + 1)`.  
Los componentes reaccionan con `effect(() => { if (this.state.operationSuccess() > 0) ... })`.

## Modal de edición — datos frescos

Al abrir una modal de edición, NO usar datos del listado (stale). Siempre llamar `state.loadById(id)` que hace `GET /api/{recurso}/{id}` y popula `selectedDetail`.

El state service necesita:
- `_selectedDetail = signal<Detail | null>(null)`
- `_isLoadingDetail = signal(false)`
- `clearErrors()` debe resetear `_selectedDetail` a `null`

La modal muestra spinner mientras `isLoadingDetail()` es true. El `ModalService.open()` recibe `isLoading: () => this.state.isLoadingDetail()` para deshabilitar el botón de confirmar.

## Campos read-only en modales

Usar `<input type="text" [value]="valor" readonly>` con clases:
```
bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm cursor-not-allowed opacity-75
```
No usar `<p>` simple — el texto se pierde visualmente sin estructura de campo.

## Toast Notifications

```typescript
// inyectar ToastService
toastService.success(message, duration?);  // 4s default
toastService.error(message, duration?);    // 5s default
toastService.warning(message);
toastService.info(message);
```

Integración CRUD estándar:
1. `pendingAction = signal<'create'|'edit'|'delete'|null>(null)` en el componente página
2. Setear antes de llamar al state: `this.pendingAction.set('create')`
3. En el effect de `operationSuccess`: lanzar toast con mensaje según `pendingAction()`

## Constantes y enums (`core/constants/`)

Por cada enum del backend, crear un archivo `{entity}-{field}.constants.ts` que exporte:
- El enum TypeScript
- Interfaz `{Name}Option { value, label }`
- Array `{NAME}_OPTIONS` para iterar en selects
- Función `get{Name}Label(value): string`

Referencia: `core/constants/unit-type.constants.ts`

## `<bt-modal>` y `<bt-toast>` — ubicación crítica

Deben estar en `main-layout.html` **fuera del `<router-outlet>`** para evitar quedar atrapados por `overflow-hidden` o `transform` de ancestros.
