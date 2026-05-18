import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
    LucideAngularModule,
    Plus, Pencil, ArrowRight, Users, Phone, Cake, Droplet,
    Receipt, Clock, CheckCircle, AlertCircle, ShieldCheck
} from 'lucide-angular';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { PatientFormModalComponent } from './patient-form-modal/patient-form-modal.component';
import { InvoiceModalComponent } from './invoice-modal/invoice-modal.component';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { MediclaimService } from '../../../core/services/mediclaim.service';
import { PatientDTO, InvoiceDTO, InvoiceStatus, MediclaimDTO } from '../../../core/models/index';
import { MediclaimModalComponent } from '../patient-detail/mediclaim-modal/mediclaim-modal.component';

type BillingTab = 'pending' | 'paid';

@Component({
    selector: 'app-patients-list',
    standalone: true,
    imports: [
        CommonModule,
        LucideAngularModule,
        NavbarComponent,
        FooterComponent,
        PatientFormModalComponent,
        InvoiceModalComponent,
        MediclaimModalComponent
    ],
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
    readonly ReceiptIcon = Receipt;
    readonly ClockIcon = Clock;
    readonly PaidIcon = CheckCircle;
    readonly AlertIcon = AlertCircle;
    readonly ShieldIcon = ShieldCheck;

    readonly InvoiceStatus = InvoiceStatus;

    patients = signal<PatientDTO[]>([]);
    isLoading = signal(true);
    errorMessage = signal('');

    allInvoices = signal<InvoiceDTO[]>([]);
    invoicesLoading = signal(false);
    billingTab = signal<BillingTab>('pending');
    selectedInvoice = signal<InvoiceDTO | null>(null);

    allMediclaims = signal<MediclaimDTO[]>([]);
    mediclaimInvoice = signal<InvoiceDTO | null>(null);

    modalOpen = signal(false);
    editingPatient = signal<PatientDTO | null>(null);

    pendingInvoices = computed(() =>
        this.allInvoices().filter(i =>
            i.invoiceStatus === InvoiceStatus.PENDING ||
            i.invoiceStatus === InvoiceStatus.READY
        )
    );

    paidInvoices = computed(() =>
        this.allInvoices().filter(i => i.invoiceStatus === InvoiceStatus.PAID)
    );

    private patientService = inject(PatientService);
    private authService = inject(AuthService);
    private invoiceService = inject(InvoiceService);
    private mediclaimService = inject(MediclaimService);
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
                if (list.length > 0) {
                    this.loadAllInvoices(list);
                    this.loadAllMediclaims(list);
                }
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

    loadAllInvoices(patients: PatientDTO[]) {
        this.invoicesLoading.set(true);
        const requests = patients.map(p =>
            this.invoiceService.getInvoicesByPatient(p.id).pipe(catchError(() => of([])))
        );

        forkJoin(requests).subscribe({
            next: (results) => {
                const all = results.flat() as InvoiceDTO[];
                all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                this.allInvoices.set(all);
                this.invoicesLoading.set(false);
            },
            error: () => {
                this.invoicesLoading.set(false);
            }
        });
    }

    loadAllMediclaims(patients: PatientDTO[]) {
        const requests = patients.map(p =>
            this.mediclaimService.getMediclaimsByPatient(p.id).pipe(catchError(() => of([])))
        );

        forkJoin(requests).subscribe({
            next: (results) => {
                const all = results.flat() as MediclaimDTO[];
                this.allMediclaims.set(all);
            },
            error: () => { }
        });
    }

    getMediclaimForInvoice(invoiceId: number): MediclaimDTO | null {
        return this.allMediclaims().find(m => m.invoiceId === invoiceId) ?? null;
    }

    getMediclaimBadgeStyle(status: string | undefined): { bg: string; text: string; border: string } {
        switch (status) {
            case 'APPROVED':
                return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
            case 'REJECTED':
                return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
            default:
                return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
        }
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

    openInvoice(invoice: InvoiceDTO, event: MouseEvent) {
        event.stopPropagation();
        this.selectedInvoice.set(invoice);
    }

    closeInvoice() {
        this.selectedInvoice.set(null);
    }

    onPaymentCompleted(invoiceId: number) {
        this.allInvoices.update(list =>
            list.map(inv =>
                inv.id === invoiceId
                    ? { ...inv, invoiceStatus: InvoiceStatus.PAID }
                    : inv
            )
        );
        this.closeInvoice();

        setTimeout(() => {
            const patients = this.patients();
            if (patients.length > 0) this.loadAllInvoices(patients);
        }, 1000);
    }

    onMediclaimSubmitted(mediclaim: MediclaimDTO) {
        this.allMediclaims.update(list => [...list, mediclaim]);
        this.closeInvoice();
    }

    getPatientName(patientId: number): string {
        return this.patients().find(p => p.id === patientId)?.fullName ?? 'Patient';
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    formatAmount(amount: number): string {
        return amount?.toFixed(2) ?? '0.00';
    }
    openMediclaimFromCard(invoice: InvoiceDTO, event: MouseEvent) {
        event.stopPropagation();
        this.mediclaimInvoice.set(invoice);
    }

    closeMediclaimModal() {
        this.mediclaimInvoice.set(null);
    }

    onMediclaimSubmittedFromCard(mediclaim: MediclaimDTO) {
        this.allMediclaims.update(list => [...list, mediclaim]);
        this.mediclaimInvoice.set(null);
    }
}