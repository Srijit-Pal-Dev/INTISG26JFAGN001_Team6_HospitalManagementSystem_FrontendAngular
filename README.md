# PulsePoint — Hospital Management System (Frontend)

> **Team Project** | Angular 21 | Tailwind CSS v3 | Spring Boot Microservices

A full-featured hospital management frontend built with Angular 21 standalone components, Signals, and Tailwind CSS. The application serves three distinct user roles — **Patient**, **Doctor**, and **Admin** — each with their own dedicated dashboard and feature set.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Application Roles & Routes](#application-roles--routes)
- [Feature Overview](#feature-overview)
  - [Public Pages](#public-pages)
  - [Patient Dashboard](#patient-dashboard)
  - [Doctor Dashboard](#doctor-dashboard)
  - [Admin Dashboard](#admin-dashboard)
- [Architecture Decisions](#architecture-decisions)
- [Core Services](#core-services)
- [Data Models](#data-models)
- [Authentication & Guards](#authentication--guards)
- [Component Breakdown](#component-breakdown)
- [Backend Integration](#backend-integration)
- [Team Responsibilities](#team-responsibilities)

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21.2.x | Frontend framework |
| TypeScript | 5.9.x | Language |
| Tailwind CSS | 3.4.x | Utility-first styling |
| Angular Material | 21.2.x | UI components (datepicker, etc.) |
| Angular CDK | 21.2.x | Overlay, accessibility primitives |
| Lucide Angular | 1.0.0 | Icon library |
| RxJS | 7.8.x | Reactive programming |
| ApexCharts | 5.x | Charts (admin dashboard) |
| Zone.js | 0.16.x | Change detection |

---

## Project Structure

```
src/
├── app/
│   ├── components/                  # Shared UI components
│   │   ├── navbar/
│   │   ├── footer/
│   │   ├── hero/
│   │   ├── sidebar/
│   │   ├── solutions/
│   │   ├── doctor/
│   │   ├── reviews/
│   │   ├── working/
│   │   ├── blog/
│   │   ├── faq/
│   │   └── cta-banner/
│   │
│   ├── core/
│   │   ├── models/                  # TypeScript interfaces & enums
│   │   │   ├── patient.model.ts
│   │   │   ├── appointment.model.ts
│   │   │   ├── doctor.model.ts
│   │   │   ├── invoice.model.ts
│   │   │   ├── medicine.model.ts
│   │   │   ├── lab-result.model.ts
│   │   │   ├── prescription.model.ts
│   │   │   └── notification-type.enum.ts
│   │   │
│   │   └── services/                # API service layer
│   │       ├── auth.service.ts
│   │       ├── patient.service.ts
│   │       ├── doctor.service.ts
│   │       ├── invoice.service.ts
│   │       ├── mediclaim.service.ts
│   │       ├── medicine.service.ts
│   │       ├── lab-result.service.ts
│   │       ├── prescription.service.ts
│   │       └── notification.service.ts
│   │
│   ├── pages/
│   │   ├── home/
│   │   ├── services-page/
│   │   ├── doctors-page/
│   │   ├── lab-page/
│   │   ├── about-page/
│   │   │
│   │   ├── patient-dashboard/
│   │   │   ├── patients-list/           # Multi-patient management + billing
│   │   │   │   ├── patient-cards/
│   │   │   │   ├── billing-section/
│   │   │   │   ├── patient-form-modal/
│   │   │   │   ├── invoice-modal/
│   │   │   │   │   └── payment-checkout/
│   │   │   │   └── mediclaim-modal/
│   │   │   │
│   │   │   └── patient-detail/          # Per-patient detail view
│   │   │       ├── tabs/
│   │   │       │   ├── book-appointment/
│   │   │       │   ├── my-appointments/
│   │   │       │   ├── medicines/
│   │   │       │   └── lab-reports/
│   │   │       │       └── lab-result-detail-modal/
│   │   │       ├── prescription-modal/
│   │   │       └── mediclaim-modal/
│   │   │
│   │   ├── doctor-dashboard/
│   │   │   └── tabs/
│   │   │       └── doctor-appointments/
│   │   │           └── prescription-modal/
│   │   │
│   │   └── adminDashboard/
│   │
│   ├── guards/                      # Route guards
│   ├── interceptors/                # HTTP interceptors
│   ├── app.routes.ts
│   ├── app.config.ts
│   └── app.component.ts
│
├── environments/
│   ├── environment.ts               # Development config
│   └── environment.prod.ts          # Production config
│
└── styles.css                       # Global styles + Tailwind directives
```

---

## Getting Started

### Prerequisites

- Node.js `>= 20.x`
- npm `>= 11.x`
- Angular CLI `>= 21.x`
- All backend microservices running (see [Backend Integration](#backend-integration))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd INTISG26JFAGN001_Team6_HospitalManagementSystem_FrontendAngular

# Install dependencies
npm install

# Start development server
ng serve
```

The application will be available at `http://localhost:4200`.

### Build

```bash
# Development build
ng build

# Production build
ng build --configuration production

# Watch mode
ng build --watch --configuration development
```

---

## Environment Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiGatewayUrl: 'http://localhost:8090'
};
```

All HTTP requests are routed through the API Gateway at port `8090`. Change `apiGatewayUrl` to point to a different gateway if needed.

---

## Application Roles & Routes

| Route | Component | Access |
|---|---|---|
| `/` | `HomeComponent` | Public |
| `/services` | `ServicesPageComponent` | Public |
| `/doctors` | `DoctorsPageComponent` | Public |
| `/lab` | `LabPageComponent` | Public |
| `/about` | `AboutPageComponent` | Public |
| `/login` | `AuthComponent` | Public |
| `/patient-dashboard` | `PatientsListComponent` | USER |
| `/patient-dashboard/:patientId` | `PatientDetailComponent` | USER |
| `/patient-dashboard/:patientId/book` | `BookAppointmentComponent` | USER |
| `/patient-dashboard/:patientId/appointments` | `MyAppointmentsComponent` | USER |
| `/patient-dashboard/:patientId/medicines` | `MedicinesComponent` | USER |
| `/patient-dashboard/:patientId/lab-reports` | `LabReportsComponent` | USER |
| `/doctor-dashboard/:doctorId` | `DoctorDashboardComponent` | DOCTOR |
| `/dashboard` | `AdminDashboardComponent` | ADMIN |

After login, users are automatically redirected based on role:
- `USER` → `/patient-dashboard`
- `DOCTOR` → `/doctor-dashboard`
- `ADMIN` → `/dashboard`

---

## Feature Overview

### Public Pages

#### Home (`/`)
- Hero section with animated doctor illustration
- Solutions overview, working process, doctor showcase
- Patient reviews, blog section, FAQ, CTA banner

#### Services (`/services`)
- Hospital services grid with icons
- How-it-works process section
- Statistics strip

#### Doctors (`/doctors`)
- Doctor listing fetched from `/doctors/all`
- Search and specialty filter
- Doctor profile cards with consultation fee

#### Lab (`/lab`)
- Lab test categories
- 3-step process explainer
- Benefits grid, FAQ

#### About (`/about`)
- Mission and values
- Team section
- Reviews

---

### Patient Dashboard

#### Patients List (`/patient-dashboard`)

Displays all patient profiles associated with the logged-in user account. Supports managing multiple family members under one account.

**Features:**
- Add / edit patient profiles (name, DOB, blood group, phone, address)
- Navigate to any patient's individual dashboard
- **Billing & Payments section** — view all invoices across all patients

**Billing Section:**
- Pending Bills tab — invoices with `PENDING` or `READY` status
- Paid Bills tab — invoices with `PAID` status
- Per-card fee breakdown (consultation, medicines, lab)
- **Pay Now flow** — secure checkout with 3-step processing animation (Verifying → Processing → Confirming)
- Payment methods: Credit/Debit Card, UPI, Net Banking
- **Mediclaim** — apply for insurance reimbursement on paid invoices; track status (PENDING / APPROVED / REJECTED)

---

#### Patient Detail (`/patient-dashboard/:patientId`)

Tabbed interface for a specific patient's medical data.

**Tab 1 — Book Appointment**
- Browse doctors with search (name, specialty, qualification)
- Select appointment date via Angular Material Datepicker
- View available time slots fetched per doctor
- Submit appointment booking

**Tab 2 — My Appointments**
- Upcoming appointments (SCHEDULED) with cancel option
- Past appointments (COMPLETED, CANCELLED, NO_SHOW)
- Expandable detail view per completed appointment:
  - **Payment gate** — details locked until invoice is paid
  - View Prescription (if exists)
  - Medicine breakdown with quantities and pricing
  - Lab report results with normal/abnormal indicators

**Tab 3 — Medicines**
- Grouped by appointment (doctor + date)
- Expandable medicine tables with unit price, quantity, total
- **Payment gate** — medicine details locked until invoice is paid
- Search across all prescriptions

**Tab 4 — Lab Reports**
- 3-column card grid
- Filter by All / Abnormal / Normal
- Search by result value, unit, technician
- **Per-result payment gate** — results locked unless corresponding appointment invoice is paid
- Locked results shown with blurred value and "Pay to unlock" indicator
- Click card → Lab Result Detail Modal (full report with print/PDF)

---

### Doctor Dashboard

- Appointment list with status filter (ALL / SCHEDULED / COMPLETED / CANCELLED / NO_SHOW)
- Mark appointment as complete
- Create prescription for completed appointments
- View existing prescriptions
- Prescription modal — diagnosis, medicines table, lab tests table, print support

---

### Admin Dashboard

- System overview (handled by teammate)
- Appointment and patient management

---

## Architecture Decisions

### Standalone Components
All components use `standalone: true` — no NgModules. Imports are declared per-component.

### Angular Signals
State management uses Angular Signals (`signal`, `computed`) throughout instead of traditional `@Input`/`@Output` chains or NgRx. This keeps components reactive with minimal boilerplate.

```typescript
// Example
patients = signal<PatientDTO[]>([]);
pendingInvoices = computed(() =>
  this.allInvoices().filter(i => i.invoiceStatus === InvoiceStatus.PENDING)
);
```

### Component Splitting Strategy
Large page components are split into focused sub-components to keep files under ~150 lines:

```
patients-list/
├── patients-list.component        (~60 lines HTML)
├── patient-cards/                 (~70 lines HTML)
├── billing-section/               (~160 lines HTML)
└── invoice-modal/
    ├── invoice-modal.component    (~180 lines HTML)
    └── payment-checkout/          (~130 lines HTML)
```

### HTTP Interceptor
JWT token is automatically attached to every outgoing request via `authInterceptor`:

```typescript
// Attaches: Authorization: Bearer <token>
provideHttpClient(withInterceptors([authInterceptor]))
```

### Scroll Restoration
```typescript
provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' }))
```

---

## Core Services

| Service | Endpoints Used | Purpose |
|---|---|---|
| `AuthService` | `/auth/login`, `/auth/register`, `/auth/refresh` | JWT auth, role detection |
| `PatientService` | `/patient/*`, `/patient/appointment/*` | Patient CRUD, appointments |
| `DoctorService` | `/doctors/*`, `/doctor-slot/*` | Doctor listing, slot availability |
| `InvoiceService` | `/invoice/*`, `/payment/*` | Invoice fetching, payment initiation/completion |
| `MediclaimService` | `/mediclaim/*` | Mediclaim creation and status tracking |
| `MedicineService` | `/patient/medicines/*` | Dispensed medicines per appointment |
| `LabResultService` | `/lab-tests/*` | Lab results per patient/appointment |
| `PrescriptionService` | `/prescriptions/*` | Prescription CRUD, existence check |
| `NotificationService` | `/notifications/*` | Real-time notification feed |

All services follow the same response unwrapping pattern:

```typescript
.pipe(map((r: any) => r.data ?? r))
```

This handles both wrapped `{ statusCode, message, data }` and raw array responses from the backend.

---

## Data Models

### Core Interfaces

```typescript
// Patient
interface PatientDTO {
  id: number;
  userId: number;
  mrn: string;
  fullName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phoneNo: string;
  address?: string;
}

// Appointment
interface AppointmentDTO {
  id: number;
  patientId: number;
  doctorId: number;
  slotId: number;
  reason: string;
  status: AppointmentStatus;   // SCHEDULED | COMPLETED | CANCELLED | NO_SHOW
  appointmentDate: string;     // dd-MM-yyyy
  appointmentTime: string;     // HH:mm
}

// Invoice
interface InvoiceDTO {
  id: number;
  invoiceNumber: string;
  patientId: number;
  appointmentId: number;
  consultationFee: number;
  medicineFee: number;
  labFee: number;
  totalAmount: number;
  invoiceStatus: InvoiceStatus; // PENDING | READY | PAID | CANCELLED
  payment?: PaymentDTO;
  patient?: PatientDTO;
  doctor?: DoctorDTO;
}

// Mediclaim
interface MediclaimDTO {
  id?: number;
  patientId: number;
  invoiceId: number;
  paymentId?: number;
  policyNumber: string;
  insurerName: string;
  coveragePercentage: number;
  refundAmount?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}
```

### Notification Types

```typescript
enum NotificationType {
  APPOINTMENT = 'APPOINTMENT',
  PRESCRIPTION = 'PRESCRIPTION',
  LAB = 'LAB',
  BILLING = 'BILLING',
  MEDICLAIM = 'MEDICLAIM',
  GENERAL = 'GENERAL'
}
```

---

## Authentication & Guards

JWT tokens are stored in `localStorage`:

```
localStorage.accessToken   — Bearer token for API requests
localStorage.refreshToken  — Token for session refresh
```

`AuthService` exposes:

```typescript
isLoggedIn(): boolean
getRole(): string        // 'USER' | 'DOCTOR' | 'ADMIN'
getUserId(): number
getUsername(): string
```

Route guards protect dashboards:
- `authGuard` - allows only authenticaled user
- `roleGuard` - allows only user with valid role

---

## Component Breakdown

### Shared Components

| Component | Description |
|---|---|
| `NavbarComponent` | Fixed top nav with role-aware links, notification bell, user menu, contact modal. Hides on scroll down, shows on scroll up. |
| `FooterComponent` | Newsletter signup, social links, sitemap links |
| `HeroComponent` | Landing page hero with animated floating badges |
| `CtaBannerComponent` | Call-to-action section used across public pages |
| `SidebarComponent` | Doctor/Admin dashboard navigation |

### Patient Dashboard Components

| Component | Description |
|---|---|
| `PatientCardsComponent` | Grid of patient profile cards |
| `BillingSectionComponent` | Pending/paid invoice cards with tab toggle |
| `PatientFormModalComponent` | Add/edit patient profile modal |
| `InvoiceModalComponent` | Full invoice document preview |
| `PaymentCheckoutComponent` | Secure checkout with 3-step payment animation |
| `MediclaimModalComponent` | Mediclaim application form and status viewer |
| `BookAppointmentComponent` | Doctor search + slot booking interface |
| `MyAppointmentsComponent` | Appointment history with expandable details |
| `MedicinesComponent` | Grouped medicine prescriptions per appointment |
| `LabReportsComponent` | Lab result cards with payment gating |
| `LabResultDetailModalComponent` | Detailed lab report with print support |
| `PrescriptionModalComponent` | Prescription document with medicines and lab tests |

---

## Backend Integration

The frontend connects to a Spring Boot microservices architecture through a single API Gateway.

### Gateway
```
http://localhost:8090
```

### Key Endpoint Groups

```
Auth          POST /auth/login
              POST /auth/register

Patients      GET  /patient/user/:userId
              POST /patient/create
              PUT  /patient/update/:id

Appointments  GET  /patient/appointment/patient/:patientId
              POST /patient/appointment/create
              DELETE /patient/appointment/delete/:id

Doctors       GET  /doctors/all
              GET  /doctors/check/:id
              GET  /doctor-slot/doctor/:doctorId

Invoices      GET  /invoice/patient/:patientId
              POST /payment/initiate/:invoiceId
              PUT  /payment/complete/:paymentId?paymentMethod=X

Mediclaim     POST /mediclaim/process
              GET  /mediclaim/patient/:patientId

Lab           GET  /lab-tests/patient/:patientId/results
              GET  /lab-tests/appointment/tests/:appointmentId

Medicines     GET  /patient/medicines/appointment/:appointmentId

Prescriptions GET  /prescriptions/appointment/:appointmentId

Notifications GET  /notifications/:userId/allMessages
```

### Required Backend Services

All of the following must be running for full functionality:

| Service | Default Port |
|---|---|
| Eureka Server | 8761 |
| API Gateway | 8090 |
| User Service | 8081 |
| Patient Service | 8082 |
| Doctor Service | 8083 |
| Billing Service | 8091 |
| Lab Service | 8084 |
| Notification Service | 8085 |

---

## Team Responsibilities

| Area | Owner |
|---|---|
| Public pages (Home, Services, Doctors, Lab, About) | Frontend Team |
| Patient Dashboard (all tabs, billing, mediclaim) | Frontend Team |
| Navbar, Footer, shared components | Frontend Team |
| Doctor Dashboard | Doctor Team Member |
| Admin Dashboard | Admin Team Member |
| Auth (Login/Register) | Shared |
| All microservices (backend) | Backend Team |

---

## Known Constraints

- All data is fetched fresh on each page load — no client-side caching layer
- JWT tokens are stored in `localStorage` (not `httpOnly` cookies)
- Backend microservices must be running locally — no mock/stub support
- IP address changes (e.g. switching networks) require restarting all backend services to re-register with Eureka

---

## Scripts Reference

```bash
npm start          # ng serve - starts dev server at localhost:4200
npm run build      # ng build - production build
npm run watch      # ng build --watch — rebuild on file changes
npm test           # ng test - run unit tests via Karma
```

---

*PulsePoint Hospital Management System - Team 6 | INTISG26JFAGN001*