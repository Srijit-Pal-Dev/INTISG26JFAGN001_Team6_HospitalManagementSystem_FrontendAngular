import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Plus, Pencil, ArrowRight, Users, Phone, Cake, Droplet } from 'lucide-angular';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { PatientFormModalComponent } from './patient-form-modal/patient-form-modal.component';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { PatientDTO } from '../../../core/models/index';

@Component({
    selector: 'app-patients-list',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, NavbarComponent, FooterComponent, PatientFormModalComponent],
    templateUrl: './patients-list.component.html'
})
export class PatientsListComponent implements OnInit {
    readonly PlusIcon = Plus;
    readonly PencilIcon = Pencil;
    readonly ArrowRightIcon = ArrowRight;
    readonly UsersIcon = Users;
    readonly PhoneIcon = Phone;
    readonly CakeIcon = Cake;
    readonly DropletIcon = Droplet;

    patients = signal<PatientDTO[]>([]);
    isLoading = signal(true);
    errorMessage = signal('');

    modalOpen = signal(false);
    editingPatient = signal<PatientDTO | null>(null);

    private patientService = inject(PatientService);
    private authService = inject(AuthService);
    private router = inject(Router);

    ngOnInit() {
        this.loadPatients();
    }

    loadPatients() {
        const userId = this.authService.getUserId();
        if (!userId) {
            this.errorMessage.set('Unable to identify user. Please log in again.');
            this.isLoading.set(false);
            return;
        }

        this.isLoading.set(true);
        this.patientService.getPatientsByUserId(userId).subscribe({
            next: (list) => {
                this.patients.set(list);
                this.isLoading.set(false);
            },
            error: (err) => {
                if (err?.status === 404) {
                    this.patients.set([]);
                } else {
                    this.errorMessage.set(err?.error?.message || 'Failed to load patients');
                }
                this.isLoading.set(false);
            }
        });
    }

    openAddModal() {
        this.editingPatient.set(null);
        this.modalOpen.set(true);
    }

    openEditModal(patient: PatientDTO, event: MouseEvent) {
        event.stopPropagation();
        this.editingPatient.set(patient);
        this.modalOpen.set(true);
    }

    onModalClosed() {
        this.modalOpen.set(false);
        this.editingPatient.set(null);
    }

    onPatientSaved(patient: PatientDTO) {
        this.modalOpen.set(false);
        this.editingPatient.set(null);
        this.loadPatients();
    }

    openPatientDashboard(patient: PatientDTO) {
        this.router.navigate(['/patient-dashboard', patient.id]);
    }
}