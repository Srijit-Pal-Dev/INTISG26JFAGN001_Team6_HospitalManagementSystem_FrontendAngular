import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CreditCard, Smartphone, Landmark, CheckCircle, XCircle, Lock, Shield } from 'lucide-angular';
import { InvoiceDTO, PaymentMethod, PaymentDTO } from '../../../../../core/models/index';
import { InvoiceService } from '../../../../../core/services/invoice.service';

type CheckoutStep = 'method' | 'processing' | 'success';

@Component({
    selector: 'app-payment-checkout',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './payment-checkout.component.html'
})
export class PaymentCheckoutComponent {
    @Input() invoice!: InvoiceDTO;
    @Output() back = new EventEmitter<void>();
    @Output() completed = new EventEmitter<number>();

    readonly CardIcon = CreditCard;
    readonly UpiIcon = Smartphone;
    readonly NetBankingIcon = Landmark;
    readonly SuccessIcon = CheckCircle;
    readonly CancelIcon = XCircle;
    readonly LockIcon = Lock;
    readonly SecureIcon = Shield;

    step = signal<CheckoutStep>('method');
    selectedMethod = signal<PaymentMethod | null>(null);
    errorMessage = signal('');
    processingStep = signal(0);
    completedPayment = signal<PaymentDTO | null>(null);

    private invoiceService = inject(InvoiceService);

    readonly PaymentMethod = PaymentMethod;

    paymentMethods = [
        { method: PaymentMethod.CARD, label: 'Credit / Debit Card', icon: 'CardIcon', desc: 'Visa, Mastercard, RuPay' },
        { method: PaymentMethod.UPI, label: 'UPI', icon: 'UpiIcon', desc: 'GPay, PhonePe, Paytm' },
        { method: PaymentMethod.CASH, label: 'Net Banking', icon: 'NetBankingIcon', desc: 'All major banks supported' },
    ];

    getIcon(key: string) {
        const map: Record<string, any> = {
            CardIcon: this.CardIcon,
            UpiIcon: this.UpiIcon,
            NetBankingIcon: this.NetBankingIcon
        };
        return map[key];
    }

    formatAmount(amount: number): string {
        return amount?.toFixed(2) ?? '0.00';
    }

    confirmPayment() {
        const method = this.selectedMethod();
        if (!method) { this.errorMessage.set('Please select a payment method'); return; }

        this.errorMessage.set('');
        this.processingStep.set(0);
        this.step.set('processing');

        setTimeout(() => {
            this.processingStep.set(1);
            this.invoiceService.initiatePayment(this.invoice.id).subscribe({
                next: (payment) => {
                    this.processingStep.set(2);
                    setTimeout(() => {
                        this.invoiceService.completePayment(payment.id, method).subscribe({
                            next: (completed) => {
                                this.completedPayment.set(completed);
                                this.step.set('success');
                            },
                            error: (err) => {
                                this.step.set('method');
                                this.errorMessage.set(err?.error?.message || 'Payment failed. Please try again.');
                            }
                        });
                    }, 1000);
                },
                error: (err) => {
                    this.step.set('method');
                    this.errorMessage.set(err?.error?.message || 'Could not initiate payment.');
                }
            });
        }, 1000);
    }

    onDone() {
        this.completed.emit(this.invoice.id);
    }
}