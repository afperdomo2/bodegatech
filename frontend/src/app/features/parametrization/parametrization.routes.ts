import type { Routes } from '@angular/router';
import { CategoriesComponent } from './categories/pages/categories/categories';
import { UnitsComponent } from './units/pages/units/units';
import { ProductsComponent } from './products/pages/products/products';
import { SuppliersComponent } from './suppliers/pages/suppliers/suppliers';

export const PARAMETRIZATION_ROUTES: Routes = [
  {
    path: 'categories',
    component: CategoriesComponent,
  },
  {
    path: 'units',
    component: UnitsComponent,
  },
  {
    path: 'products',
    component: ProductsComponent,
  },
  {
    path: 'suppliers',
    component: SuppliersComponent,
  },
];
