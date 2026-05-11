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
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/services-page/services-page.component').then(m => m.ServicesPageComponent)
  },
  {
    path: 'doctors',
    loadComponent: () =>
      import('./pages/doctors-page/doctors-page.component').then(m => m.DoctorsPageComponent)
  },
  {
    path: 'lab',
    loadComponent: () =>
      import('./pages/lab-page/lab-page.component').then(m => m.LabPageComponent)
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about-page/about-page.component').then(m => m.AboutPageComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/adminDashboard/adminDashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'patient-dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['USER'] },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/patient-dashboard/patients-list/patients-list.component').then(m => m.PatientsListComponent)
      },
      {
        path: ':patientId',
        loadComponent: () =>
          import('./pages/patient-dashboard/patient-detail/patient-detail.component').then(m => m.PatientDetailComponent),
        children: [
          { path: '', redirectTo: 'book', pathMatch: 'full' },
          {
            path: 'book',
            loadComponent: () =>
              import('./pages/patient-dashboard/patient-detail/tabs/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent)
          },
          {
            path: 'appointments',
            loadComponent: () =>
              import('./pages/patient-dashboard/patient-detail/tabs/my-appointments/my-appointments.component').then(m => m.MyAppointmentsComponent)
          },
          {
            path: 'medicines',
            loadComponent: () =>
              import('./pages/patient-dashboard/patient-detail/tabs/medicines/medicines.component').then(m => m.MedicinesComponent)
          },
          {
            path: 'lab-reports',
            loadComponent: () =>
              import('./pages/patient-dashboard/patient-detail/tabs/lab-reports/lab-reports.component').then(m => m.LabReportsComponent)
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];