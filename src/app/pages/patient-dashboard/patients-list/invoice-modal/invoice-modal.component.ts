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
        { method: PaymentMethod.CASH, label: 'Cash', icon: 'CashIcon', desc: 'Pay at counter' }
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
        const printContent = document.getElementById('invoice-print-area');
        if (!printContent) return;

        let html = printContent.innerHTML;
        html = html.replace(/src="\.\/logo\.png"/g, `src="${window.location.origin}/logo.png"`);
        html = html.replace(/src="logo\.png"/g, `src="${window.location.origin}/logo.png"`);

        const win = window.open('', '_blank', 'width=850,height=1000');
        if (!win) return;

        win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Invoice - ${this.invoice.invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #2d3748; background: white; padding: 15mm 20mm; font-size: 13px; line-height: 1.5; }
    img { max-width: 160px; height: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding-bottom: 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #718096; border-bottom: 2px solid #2d3748; }
    td { padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    td:last-child { text-align: right; }
    th:last-child { text-align: right; }
    tfoot td { border-bottom: none; padding: 6px 0; font-size: 12px; color: #718096; }
    tfoot tr:last-child td { font-size: 18px; font-weight: 900; color: #2d3748; padding-top: 12px; border-top: 2px solid #2d3748; }
    tfoot tr:last-child td:last-child { color: #1a7fd4; }
    lucide-icon, svg { display: none !important; }
    @page { size: A4 portrait; margin: 0; }
  </style>
</head>
<body>${html}</body>
</html>`);

        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 500);
    }
    onClose() {
        this.closed.emit();
    }
}