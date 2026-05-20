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
    path: 'lab-dashboard',
    loadComponent: () =>
      import('./pages/lab/lab.component').then(m => m.LabComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LAB_TECHNICIAN'] }
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
    path: 'pharmacy-dashboard',
    loadComponent: () =>
      import('./pages/pharmacy/pharmacy-dashboard.component').then(m => m.PharmacyDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PHARMACIST'] },
    children: [
      { path: '', redirectTo: 'medicines', pathMatch: 'full' },
      {
        path: 'medicines',
        loadComponent: () =>
          import('./pages/pharmacy/medicines/medicine-list/medicine-list.component').then(m => m.MedicineListComponent)
      },
      {
        path: 'medicines/add',
        loadComponent: () =>
          import('./pages/pharmacy/medicines/add-medicine/add-medicine.component').then(m => m.AddMedicineComponent)
      },
      {
        path: 'medicines/edit/:id',
        loadComponent: () =>
          import('./pages/pharmacy/medicines/add-medicine/add-medicine.component').then(m => m.AddMedicineComponent)
      },
      {
        path: 'medicines/detail/:id',
        loadComponent: () =>
          import('./pages/pharmacy/medicines/medicine-detail/medicine-detail.component').then(m => m.MedicineDetailComponent)
      },
      {
        path: 'dispenses',
        loadComponent: () =>
          import('./pages/pharmacy/dispenses/dispense-list/dispense-list.component').then(m => m.DispenseListComponent)
      },
      {
        path: 'dispenses/create',
        loadComponent: () =>
          import('./pages/pharmacy/dispenses/edit-dispense/edit-dispense.component').then(m => m.EditDispenseComponent)
      },
      {
        path: 'dispenses/edit/:id',
        loadComponent: () =>
          import('./pages/pharmacy/dispenses/edit-dispense/edit-dispense.component').then(m => m.EditDispenseComponent)
      },
      {
        path: 'dispenses/appointment',
        loadComponent: () =>
          import('./pages/pharmacy/dispenses/appointment-medicines/appointment-medicines.component').then(m => m.AppointmentMedicinesComponent)
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/pharmacy/notifications/notifications.component').then(m => m.PhNotificationsComponent)
      }
    ]
  },
  {
    path: 'doctor-dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DOCTOR'] },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/doctor-dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent)
      },
      {
        path: ':doctorId',
        loadComponent: () =>
          import('./pages/doctor-dashboard/doctor-profile-detail/doctor-profile-detail.component').then(m => m.DoctorProfileDetailComponent),
        children: [
          { path: '', redirectTo: 'slots', pathMatch: 'full' },
          {
            path: 'slots',
            loadComponent: () =>
              import('./pages/doctor-dashboard/doctor-profile-detail/tabs/slots-management/slots-management.component').then(m => m.SlotsManagementComponent)
          },
          {
            path: 'appointments',
            loadComponent: () =>
              import('./pages/doctor-dashboard/doctor-profile-detail/tabs/doctor-appointments/doctor-appointments.component').then(m => m.DoctorAppointmentsComponent)
          },
          {
            path: 'prescription/:appointmentId',
            loadComponent: () =>
              import('./pages/doctor-dashboard/doctor-profile-detail/tabs/create-prescription/create-prescription.component').then(m => m.CreatePrescriptionComponent)
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
