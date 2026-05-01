import type { Routes } from '@angular/router';
import { CategoriesComponent } from './categories/pages/categories/categories';
import { UnitsComponent } from './units/pages/units/units';

export const PARAMETRIZATION_ROUTES: Routes = [
  {
    path: 'categories',
    component: CategoriesComponent,
  },
  {
    path: 'units',
    component: UnitsComponent,
  },
];
