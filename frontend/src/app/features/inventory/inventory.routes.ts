import type { Routes } from '@angular/router';
import { InventoryComponent } from './pages/inventory/inventory';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    component: InventoryComponent,
  },
];
