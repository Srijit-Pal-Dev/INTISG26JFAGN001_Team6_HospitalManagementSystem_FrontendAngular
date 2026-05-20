import { Component, Input, Output, EventEmitter, signal, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    LucideAngularModule, X, Printer, CreditCard, Smartphone,
    Banknote, CheckCircle, Clock, XCircle, FileText, ShieldCheck
} from 'lucide-angular';
import {
    InvoiceDTO, PaymentMethod, PaymentDTO,
    InvoiceStatus, PaymentStatus, MediclaimDTO
} from '../../../../core/models/index';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { MediclaimModalComponent } from '../../patient-detail/mediclaim-modal/mediclaim-modal.component';

type ModalStep = 'invoice' | 'payment-method' | 'success';

@Component({
    selector: 'app-invoice-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, MediclaimModalComponent],
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
    readonly CardIcon = CreditCard;
    readonly UpiIcon = Smartphone;
    readonly CashIcon = Banknote;
    readonly SuccessIcon = CheckCircle;
    readonly PendingIcon = Clock;
    readonly CancelIcon = XCircle;
    readonly InvoiceIcon = FileText;
    readonly ShieldIcon = ShieldCheck;

    readonly InvoiceStatus = InvoiceStatus;
    readonly PaymentStatus = PaymentStatus;
    readonly PaymentMethod = PaymentMethod;

    step = signal<ModalStep>('invoice');
    selectedMethod = signal<PaymentMethod | null>(null);
    isProcessing = signal(false);
    errorMessage = signal('');
    completedPayment = signal<PaymentDTO | null>(null);
    showMediclaimModal = signal(false);

    paymentMethods = [
        { method: PaymentMethod.CARD, label: 'Credit / Debit Card', icon: 'CardIcon', desc: 'Visa, Mastercard, RuPay' },
        { method: PaymentMethod.UPI, label: 'UPI', icon: 'UpiIcon', desc: 'GPay, PhonePe, Paytm' },
    ];

    private invoiceService = inject(InvoiceService);

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

    getMediclaimStatusStyle(): { bg: string; text: string; border: string; label: string } {
        switch (this.mediclaim?.status) {
            case 'APPROVED':
                return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Approved' };
            case 'REJECTED':
                return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Rejected' };
            default:
                return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Pending Review' };
        }
    }

    getIcon(key: string) {
        const map: Record<string, any> = {
            CardIcon: this.CardIcon,
            UpiIcon: this.UpiIcon,
            CashIcon: this.CashIcon
        };
        return map[key];
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

    proceedToPayment() {
        this.step.set('payment-method');
        this.selectedMethod.set(null);
        this.errorMessage.set('');
    }

    confirmPayment() {
        const method = this.selectedMethod();
        if (!method) {
            this.errorMessage.set('Please select a payment method');
            return;
        }

        this.isProcessing.set(true);
        this.errorMessage.set('');

        this.invoiceService.initiatePayment(this.invoice.id).subscribe({
            next: (payment) => {
                this.invoiceService.completePayment(payment.id, method).subscribe({
                    next: (completed) => {
                        this.completedPayment.set(completed);
                        this.isProcessing.set(false);
                        this.step.set('success');
                    },
                    error: (err) => {
                        this.isProcessing.set(false);
                        this.errorMessage.set(err?.error?.message || 'Payment failed. Please try again.');
                    }
                });
            },
            error: (err) => {
                this.isProcessing.set(false);
                this.errorMessage.set(err?.error?.message || 'Could not initiate payment. Please try again.');
            }
        });
    }

    onPaymentSuccess() {
        this.paymentCompleted.emit(this.invoice.id);
        this.closed.emit();
    }

    openMediclaimModal() {
        this.showMediclaimModal.set(true);
    }

    onMediclaimModalClosed() {
        this.showMediclaimModal.set(false);
    }

    onMediclaimSubmitted(mediclaim: MediclaimDTO) {
        this.showMediclaimModal.set(false);
        this.mediclaimSubmitted.emit(mediclaim);
    }

    printInvoice() {
        window.print();
    }
    onClose() {
        this.closed.emit();
    }
}