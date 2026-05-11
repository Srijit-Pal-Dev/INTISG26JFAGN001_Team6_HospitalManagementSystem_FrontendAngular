import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Printer, CreditCard, Smartphone, Banknote, CheckCircle, Clock, XCircle, FileText } from 'lucide-angular';
import { InvoiceDTO, PaymentMethod, PaymentDTO, InvoiceStatus, PaymentStatus } from '../../../../core/models/index';
import { InvoiceService } from '../../../../core/services/invoice.service';
type ModalStep = 'invoice' | 'payment-method' | 'success';

@Component({
    selector: 'app-invoice-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './invoice-modal.component.html'
})
export class InvoiceModalComponent {
    @Input() invoice!: InvoiceDTO;
    @Output() closed = new EventEmitter<void>();
    @Output() paymentCompleted = new EventEmitter<void>();

    readonly XIcon = X;
    readonly PrinterIcon = Printer;
    readonly CardIcon = CreditCard;
    readonly UpiIcon = Smartphone;
    readonly CashIcon = Banknote;
    readonly SuccessIcon = CheckCircle;
    readonly PendingIcon = Clock;
    readonly CancelIcon = XCircle;
    readonly InvoiceIcon = FileText;

    readonly InvoiceStatus = InvoiceStatus;
    readonly PaymentStatus = PaymentStatus;
    readonly PaymentMethod = PaymentMethod;

    step = signal<ModalStep>('invoice');
    selectedMethod = signal<PaymentMethod | null>(null);
    isProcessing = signal(false);
    errorMessage = signal('');
    completedPayment = signal<PaymentDTO | null>(null);

    paymentMethods = [
        { method: PaymentMethod.CARD, label: 'Credit / Debit Card', icon: 'CardIcon', desc: 'Visa, Mastercard, RuPay' },
        { method: PaymentMethod.UPI, label: 'UPI', icon: 'UpiIcon', desc: 'GPay, PhonePe, Paytm' },
        { method: PaymentMethod.CASH, label: 'Cash', icon: 'CashIcon', desc: 'Pay at counter' }
    ];

    private invoiceService = inject(InvoiceService);

    get canPay(): boolean {
        return this.invoice.invoiceStatus === InvoiceStatus.PENDING ||
            this.invoice.invoiceStatus === InvoiceStatus.READY;
    }

    get isAlreadyPaid(): boolean {
        return this.invoice.invoiceStatus === InvoiceStatus.PAID;
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
        this.paymentCompleted.emit();
        this.closed.emit();
    }

    printInvoice() {
        window.print();
    }

    onClose() {
        this.closed.emit();
    }
}