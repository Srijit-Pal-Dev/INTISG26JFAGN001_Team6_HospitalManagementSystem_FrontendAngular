import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
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
  // Future:
  // {
  //   path: 'patient',
  //   loadComponent: () =>
  //     import('./pages/patient/patient.component').then(m => m.PatientComponent)
  // },
  // {
  //   path: 'doctor-dashboard',
  //   loadComponent: () =>
  //     import('./doctor/doctor.component').then(m => m.DoctorComponent),
  //   canActivate: [authGuard, roleGuard],
  //   data: { roles: ['DOCTOR'] }
  // },
  {
    path: '**',
    redirectTo: ''
  }
];