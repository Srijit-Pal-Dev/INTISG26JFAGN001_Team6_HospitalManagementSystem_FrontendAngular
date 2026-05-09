import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, ArrowLeft, CalendarPlus, ClipboardList, Pill, FlaskConical } from 'lucide-angular';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { PatientService } from '../../../core/services/patient.service';
import { PatientDTO } from '../../../core/models/index';

@Component({
    selector: 'app-patient-detail',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, NavbarComponent, FooterComponent],
    templateUrl: './patient-detail.component.html'
})
export class PatientDetailComponent implements OnInit {
    readonly ArrowLeftIcon = ArrowLeft;
    readonly BookIcon = CalendarPlus;
    readonly AppointmentsIcon = ClipboardList;
    readonly MedicinesIcon = Pill;
    readonly LabIcon = FlaskConical;

    patient = signal<PatientDTO | null>(null);
    patientId = signal<number | null>(null);
    isLoading = signal(true);
    errorMessage = signal('');

    tabs = [
        { label: 'Book Appointment', path: 'book', icon: 'BookIcon' },
        { label: 'My Appointments', path: 'appointments', icon: 'AppointmentsIcon' },
        { label: 'Medicines', path: 'medicines', icon: 'MedicinesIcon' },
        { label: 'Lab Reports', path: 'lab-reports', icon: 'LabIcon' }
    ];

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private patientService = inject(PatientService);

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = Number(params['patientId']);
            if (!id) {
                this.router.navigate(['/patient-dashboard']);
                return;
            }
            this.patientId.set(id);
            this.loadPatient(id);
        });
    }

    loadPatient(id: number) {
        this.isLoading.set(true);
        this.patientService.getPatientById(id).subscribe({
            next: (p) => {
                this.patient.set(p);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to load patient:', err);
                this.errorMessage.set(
                    err?.error?.message || `Error ${err?.status}: ${err?.statusText || 'Patient not found'}`
                );
                this.isLoading.set(false);
            }
        });
    }

    goBack() {
        this.router.navigate(['/patient-dashboard']);
    }

    getInitials(name: string): string {
        return name
            .split(' ')
            .map(p => p.charAt(0))
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }

    getIcon(key: string) {
        const map: Record<string, any> = {
            BookIcon: this.BookIcon,
            AppointmentsIcon: this.AppointmentsIcon,
            MedicinesIcon: this.MedicinesIcon,
            LabIcon: this.LabIcon
        };
        return map[key];
    }
}