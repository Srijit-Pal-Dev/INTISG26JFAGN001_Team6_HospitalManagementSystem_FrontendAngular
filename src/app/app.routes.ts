import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./adminDashboard/adminDashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  // Doctor dashboard — only DOCTOR allowed
  // {
  //   path: 'doctor-dashboard',
  //   loadComponent: () =>
  //     import('./doctor/doctor.component')
  //       .then(m => m.DoctorComponent),
  //   canActivate: [authGuard, roleGuard],
  //   data: { roles: ['DOCTOR'] }
  // },
  {
    path: '**',
    redirectTo: 'login'
  }
];