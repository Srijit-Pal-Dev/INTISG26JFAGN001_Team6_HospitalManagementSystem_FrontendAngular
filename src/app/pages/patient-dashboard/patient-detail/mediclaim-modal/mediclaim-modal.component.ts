import { Component, Input, Output, EventEmitter, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, ShieldCheck, CheckCircle, AlertCircle, Clock } from 'lucide-angular';
import { MediclaimDTO, InvoiceDTO } from '../../../../core/models/index';
import { MediclaimService } from '../../../../core/services/mediclaim.service';

type ModalStep = 'form' | 'success';

@Component({
    selector: 'app-mediclaim-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './mediclaim-modal.component.html'
})
export class MediclaimModalComponent implements OnInit {
    @Input() invoice!: InvoiceDTO;
    @Input() existingMediclaim: MediclaimDTO | null = null;
    @Output() closed = new EventEmitter<void>();
    @Output() submitted = new EventEmitter<MediclaimDTO>();

    readonly XIcon = X;
    readonly ShieldIcon = ShieldCheck;
    readonly SuccessIcon = CheckCircle;
    readonly AlertIcon = AlertCircle;
    readonly ClockIcon = Clock;

    step = signal<ModalStep>('form');
    isSubmitting = signal(false);
    errorMessage = signal('');
    submittedMediclaim = signal<MediclaimDTO | null>(null);

    policyNumber = '';
    insurerName = '';
    coveragePercentage: number | null = null;

    private mediclaimService = inject(MediclaimService);

    ngOnInit() {
        if (this.existingMediclaim) {
            this.policyNumber = this.existingMediclaim.policyNumber;
            this.insurerName = this.existingMediclaim.insurerName;
            this.coveragePercentage = Number(this.existingMediclaim.coveragePercentage);
        }
    }

    get isViewMode(): boolean {
        return !!this.existingMediclaim;
    }

    get statusStyle(): { bg: string; text: string; label: string; icon: any } {
        switch (this.existingMediclaim?.status) {
            case 'APPROVED':
                return { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved', icon: this.SuccessIcon };
            case 'REJECTED':
                return { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: this.AlertIcon };
            default:
                return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Review', icon: this.ClockIcon };
        }
    }

    validate(): boolean {
        if (!this.policyNumber.trim()) {
            this.errorMessage.set('Policy number is required');
            return false;
        }
        if (!this.insurerName.trim()) {
            this.errorMessage.set('Insurer name is required');
            return false;
        }
        if (!this.coveragePercentage || this.coveragePercentage <= 0 || this.coveragePercentage > 100) {
            this.errorMessage.set('Coverage percentage must be between 1 and 100');
            return false;
        }
        return true;
    }

    onSubmit() {
        this.errorMessage.set('');
        if (!this.validate()) return;

        const dto: MediclaimDTO = {
            patientId: this.invoice.patientId,
            invoiceId: this.invoice.id,
            policyNumber: this.policyNumber.trim(),
            insurerName: this.insurerName.trim(),
            coveragePercentage: this.coveragePercentage!
        };

        // Only add paymentId if it exists
        if (this.invoice.payment?.id) {
            dto.paymentId = this.invoice.payment.id;
        }

        this.isSubmitting.set(true);
        this.mediclaimService.createMediclaim(dto).subscribe({
            next: (result) => {
                this.submittedMediclaim.set(result);
                this.isSubmitting.set(false);
                this.step.set('success');
                this.submitted.emit(result);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                this.errorMessage.set(err?.error?.message || 'Failed to submit claim. Please try again.');
            }
        });
    }

    onClose() {
        this.closed.emit();
    }
}