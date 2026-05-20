import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Receipt, CheckCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-angular';
import { InvoiceDTO, InvoiceStatus, MediclaimDTO } from '../../../../core/models/index';

type BillingTab = 'pending' | 'paid';

@Component({
    selector: 'app-billing-section',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './billing-section.component.html'
})
export class BillingSectionComponent {
    @Input() allInvoices: InvoiceDTO[] = [];
    @Input() invoicesLoading = false;
    @Input() billingTab: BillingTab = 'pending';
    @Input() allMediclaims: MediclaimDTO[] = [];

    @Output() tabChange = new EventEmitter<BillingTab>();
    @Output() openInvoice = new EventEmitter<{ invoice: InvoiceDTO; event: MouseEvent }>();
    @Output() openMediclaim = new EventEmitter<{ invoice: InvoiceDTO; event: MouseEvent }>();

    readonly ReceiptIcon = Receipt;
    readonly PaidIcon = CheckCircle;
    readonly AlertIcon = AlertCircle;
    readonly ArrowRightIcon = ArrowRight;
    readonly ShieldIcon = ShieldCheck;

    readonly InvoiceStatus = InvoiceStatus;

    get pendingInvoices() {
        return this.allInvoices.filter(i =>
            i.invoiceStatus === InvoiceStatus.PENDING ||
            i.invoiceStatus === InvoiceStatus.READY
        );
    }

    get paidInvoices() {
        return this.allInvoices.filter(i => i.invoiceStatus === InvoiceStatus.PAID);
    }

    getMediclaimForInvoice(invoiceId: number): MediclaimDTO | null {
        return this.allMediclaims.find(m => m.invoiceId === invoiceId) ?? null;
    }

    getMediclaimBadgeStyle(status: string | undefined): { text: string } {
        switch (status) {
            case 'APPROVED': return { text: 'text-green-700' };
            case 'REJECTED': return { text: 'text-red-700' };
            default: return { text: 'text-yellow-700' };
        }
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    formatAmount(amount: number): string {
        return amount?.toFixed(2) ?? '0.00';
    }
}