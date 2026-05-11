import { Component, EventEmitter, Input, Output, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, User } from 'lucide-angular';
import { PatientService } from '../../../../core/services/patient.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PatientDTO, CreatePatientRequest } from '../../../../core/models/index';

@Component({
    selector: 'app-patient-form-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './patient-form-modal.component.html'
})
export class PatientFormModalComponent implements OnInit {
    @Input() patient: PatientDTO | null = null;
    @Output() closed = new EventEmitter<void>();
    @Output() saved = new EventEmitter<PatientDTO>();

    readonly XIcon = X;
    readonly UserIcon = User;

    isLoading = signal(false);
    errorMessage = signal('');

    formData: CreatePatientRequest = {
        userId: 0,
        fullName: '',
        dob: '',
        age: 0,
        gender: '',
        bloodGroup: '',
        phoneNo: '',
        address: ''
    };

    bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    genders = ['Male', 'Female', 'Other'];

    private patientService = inject(PatientService);
    private authService = inject(AuthService);

    ngOnInit() {
        const userId = this.authService.getUserId();
        this.formData.userId = userId ?? 0;

        if (this.patient) {
            this.formData = {
                userId: this.patient.userId,
                fullName: this.patient.fullName,
                dob: this.patient.dob,
                age: this.patient.age,
                gender: this.patient.gender,
                bloodGroup: this.patient.bloodGroup,
                phoneNo: this.patient.phoneNo,
                address: this.patient.address
            };
        }
    }

    onDobChange() {
        if (!this.formData.dob) return;
        const dob = new Date(this.formData.dob);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        this.formData.age = age >= 0 ? age : 0;
    }

    validate(): boolean {
        if (!this.formData.fullName.trim()) { this.errorMessage.set('Full name is required'); return false; }
        if (!this.formData.dob) { this.errorMessage.set('Date of birth is required'); return false; }
        if (!this.formData.gender) { this.errorMessage.set('Gender is required'); return false; }
        if (!this.formData.bloodGroup) { this.errorMessage.set('Blood group is required'); return false; }
        if (!this.formData.phoneNo || this.formData.phoneNo.length < 10) { this.errorMessage.set('Valid phone number required'); return false; }
        if (!this.formData.address.trim()) { this.errorMessage.set('Address is required'); return false; }
        return true;
    }

    onSubmit() {
        this.errorMessage.set('');
        if (!this.validate()) return;

        this.isLoading.set(true);
        const obs = this.patient
            ? this.patientService.updatePatient(this.patient.id, this.formData)
            : this.patientService.createPatient(this.formData);

        obs.subscribe({
            next: (saved) => {
                this.isLoading.set(false);
                this.saved.emit(saved);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set(err?.error?.message || 'Failed to save patient');
            }
        });
    }

    onClose() {
        this.closed.emit();
    }
}