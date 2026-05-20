import { Component, Input, Output, EventEmitter, signal, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    LucideAngularModule, X, Printer, CheckCircle,
    Clock, XCircle, FileText, ShieldCheck
} from 'lucide-angular';
import {
    InvoiceDTO, InvoiceStatus, MediclaimDTO
} from '../../../../core/models/index';
import { MediclaimModalComponent } from '../../patient-detail/mediclaim-modal/mediclaim-modal.component';
import { PaymentCheckoutComponent } from './payment-checkout/payment-checkout.component';

type ModalStep = 'invoice' | 'checkout';

@Component({
    selector: 'app-invoice-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, MediclaimModalComponent, PaymentCheckoutComponent],
    templateUrl: './invoice-modal.component.html'
})
export class InvoiceModalComponent implements OnChanges {
    @Input() invoice!: InvoiceDTO;
    @Input() mediclaim: MediclaimDTO | null = null;
    @Output() closed = new EventEmitter<void>();
    @Output() paymentCompleted = new EventEmitter<number>();
    @Output() mediclaimSubmitted = new EventEmitter<MediclaimDTO>();

    readonly XIcon = X;
    readonly PrinterIcon = Printer;
    readonly SuccessIcon = CheckCircle;
    readonly PendingIcon = Clock;
    readonly CancelIcon = XCircle;
    readonly InvoiceIcon = FileText;
    readonly ShieldIcon = ShieldCheck;

    readonly InvoiceStatus = InvoiceStatus;

    step = signal<ModalStep>('invoice');
    showMediclaimModal = signal(false);

    ngOnChanges() {
        this.step.set('invoice');
        this.showMediclaimModal.set(false);
    }

    get canPay(): boolean {
        return this.invoice.invoiceStatus === InvoiceStatus.PENDING ||
            this.invoice.invoiceStatus === InvoiceStatus.READY;
    }

    get isAlreadyPaid(): boolean {
        return this.invoice.invoiceStatus === InvoiceStatus.PAID;
    }

    get canApplyMediclaim(): boolean {
        return this.isAlreadyPaid && !this.mediclaim;
    }

    get hasMediclaim(): boolean {
        return !!this.mediclaim;
    }

    getMediclaimStatusStyle(): { text: string; label: string } {
        switch (this.mediclaim?.status) {
            case 'APPROVED': return { text: 'text-green-600', label: 'Approved' };
            case 'REJECTED': return { text: 'text-red-500', label: 'Rejected' };
            default: return { text: 'text-yellow-600', label: 'Pending Review' };
        }
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    formatAmount(amount: number): string {
        return amount?.toFixed(2) ?? '0.00';
    }

    onPaymentCompleted(invoiceId: number) {
        this.paymentCompleted.emit(invoiceId);
        this.closed.emit();
    }

    openMediclaimModal() { this.showMediclaimModal.set(true); }
    onMediclaimModalClosed() { this.showMediclaimModal.set(false); }

    onMediclaimSubmitted(mediclaim: MediclaimDTO) {
        this.showMediclaimModal.set(false);
        this.mediclaimSubmitted.emit(mediclaim);
    }

    printInvoice() { window.print(); }
    onClose() { this.closed.emit(); }
}