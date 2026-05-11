import type { Routes } from '@angular/router';

export const MOVEMENTS_REGISTER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/movement-register/movement-register')
      .then(m => m.MovementRegisterComponent),
  },
];