import type { Routes } from '@angular/router';
import { InventoryComponent } from './inventory/pages/inventory/inventory';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    component: InventoryComponent,
  },
  {
    path: 'movements',
    loadComponent: () => import('./movements/pages/movements/movements').then(m => m.MovementsComponent),
  },
  {
    path: 'movements-register',
    loadChildren: () => import('./movements-register/movements-register.routes').then(m => m.MOVEMENTS_REGISTER_ROUTES),
  },
];