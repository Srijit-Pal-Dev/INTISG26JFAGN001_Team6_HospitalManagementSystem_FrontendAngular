import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Plus, Trash2, ArrowLeft, Send, Pill, FlaskConical, FileText, CheckCircle, Search, Package } from 'lucide-angular';
import { PrescriptionService } from '../../../../../core/services/prescription.service';
import { PatientService } from '../../../../../core/services/patient.service';
import { MedicineService } from '../../../../../core/services/medicine.service';
import { AppointmentDTO, CreatePrescriptionRequest, PrescriptionMedicineItem, PrescriptionLabTestItem, Medicine } from '../../../../../core/models/index';

@Component({
    selector: 'app-create-prescription',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './create-prescription.component.html',
    styleUrl: './create-prescription.component.css'
})
export class CreatePrescriptionComponent implements OnInit {
    readonly PlusIcon = Plus;
    readonly TrashIcon = Trash2;
    readonly BackIcon = ArrowLeft;
    readonly SendIcon = Send;
    readonly PillIcon = Pill;
    readonly LabIcon = FlaskConical;
    readonly PrescriptionIcon = FileText;
    readonly SuccessIcon = CheckCircle;
    readonly SearchIcon = Search;
    readonly PackageIcon = Package;

    doctorId = signal<number>(0);
    appointmentId = signal<number>(0);
    appointment = signal<AppointmentDTO | null>(null);
    isLoadingAppt = signal(true);
    apptError = signal('');

    diagnosis = signal('');
    doctorNotes = signal('');
    labRequired = false;

    // Plain arrays for ngModel (avoids focus loss on signal re-render)
    medicines: PrescriptionMedicineItem[] = [];
    labTests: PrescriptionLabTestItem[] = [];

    // Medicine picker
    allMedicines = signal<Medicine[]>([]);
    medicineSearch = signal('');
    isLoadingMedicines = signal(false);
    medicinesError = signal('');

    filteredMedicines = computed(() => {
        const q = this.medicineSearch().toLowerCase().trim();
        const all = this.allMedicines();
        if (!q) return all;
        return all.filter(m =>
            m.name.toLowerCase().includes(q) ||
            m.category?.toLowerCase().includes(q) ||
            String(m.id).includes(q)
        );
    });

    isSubmitting = signal(false);
    submitError = signal('');
    showSuccess = signal(false);

    private prescriptionService = inject(PrescriptionService);
    private patientService = inject(PatientService);
    private medicineService = inject(MedicineService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    ngOnInit(): void {
        this.route.parent?.params.subscribe(params => {
            const dId = Number(params['doctorId']);
            if (!isNaN(dId)) this.doctorId.set(dId);
        });

        this.route.params.subscribe(params => {
            const aId = Number(params['appointmentId']);
            if (!isNaN(aId) && aId > 0) {
                this.appointmentId.set(aId);
                this.loadAppointment(aId);
            }
        });

        this.loadMedicines();
    }

    loadAppointment(id: number): void {
        this.isLoadingAppt.set(true);
        this.patientService.getAppointmentById(id).subscribe({
            next: (appt) => {
                this.appointment.set(appt);
                this.isLoadingAppt.set(false);
            },
            error: (err) => {
                this.apptError.set(err?.error?.message || 'Failed to load appointment');
                this.isLoadingAppt.set(false);
            }
        });
    }

    loadMedicines(): void {
        this.isLoadingMedicines.set(true);
        this.medicinesError.set('');
        this.medicineService.getAll().subscribe({
            next: (list) => {
                this.allMedicines.set(list);
                this.isLoadingMedicines.set(false);
            },
            error: (err) => {
                this.medicinesError.set(err?.error?.message || 'Failed to load medicines');
                this.isLoadingMedicines.set(false);
            }
        });
    }

    isSelected(med: Medicine): boolean {
        return this.medicines.some(m => m.medicineName === med.name);
    }

    selectMedicine(med: Medicine): void {
        if (this.isSelected(med)) return;
        this.medicines = [
            ...this.medicines,
            {
                medicineId: med.id,
                medicineName: med.name,
                dosage: med.dosageStrength ?? '',
                frequency: '',
                duration: '',
                instructions: '',
                quantity: 1
            }
        ];
    }

    removeMedicine(index: number): void {
        this.medicines = this.medicines.filter((_, i) => i !== index);
    }

    // Lab test helpers
    addLabTest(): void {
        this.labTests = [...this.labTests, { testName: '', notes: '' }];
        this.labRequired = true;
    }

    removeLabTest(index: number): void {
        this.labTests = this.labTests.filter((_, i) => i !== index);
        if (this.labTests.length === 0) this.labRequired = false;
    }

    onLabRequiredChange(checked: boolean): void {
        this.labRequired = checked;
        if (checked && this.labTests.length === 0) {
            this.addLabTest();
        }
    }

    canSubmit(): boolean {
        const appt = this.appointment();
        if (!appt) return false;
        if (!this.diagnosis().trim()) return false;
        if (this.medicines.length === 0) return false;
        if (this.medicines.some(m => !m.medicineName.trim())) return false;
        if (this.labRequired && this.labTests.some(t => !t.testName.trim())) return false;
        return true;
    }

    submit(): void {
        if (!this.canSubmit() || this.isSubmitting()) return;

        const appt = this.appointment()!;
        const req: CreatePrescriptionRequest = {
            appointmentId: appt.id,
            patientId: appt.patientId,
            diagnosis: this.diagnosis().trim(),
            doctorNotes: this.doctorNotes().trim() || undefined,
            labRequired: this.labRequired,
            medicines: this.medicines.filter(m => m.medicineName.trim()),
            labTests: this.labRequired ? this.labTests.filter(t => t.testName.trim()) : []
        };

        this.isSubmitting.set(true);
        this.submitError.set('');

        this.prescriptionService.createPrescription(req).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.showSuccess.set(true);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                this.submitError.set(err?.error?.message || 'Failed to create prescription');
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/doctor-dashboard', this.doctorId(), 'appointments']);
    }

    formatDateForDisplay(dateStr: string): string {
        const [dd, mm, yyyy] = dateStr.split('-');
        const d = new Date(+yyyy, +mm - 1, +dd);
        return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    }

    formatTimeForDisplay(time: string): string {
        const [h, m] = time.split(':');
        const hour = parseInt(h, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${display}:${m} ${period}`;
    }
}
